import requests
import inspect
import json
import subprocess
from pathlib import Path
from typing import Annotated, get_origin, get_args, Any, Callable, Union, Final
from dataclasses import dataclass, field
from rich.console import Console
import datetime
import getpass


# ============================================================
# PROJECT SECURITY
# ============================================================

# THIS IS THE ONLY DIRECTORY THE AI AGENT IS ALLOWED TO ACCESS
PROJECT_ROOT = Path("/Users/tt/gitRepos/ai-madonna-medi-spa").resolve()


# Files/directories that are normally not useful for the coding agent
IGNORED_DIRECTORIES = {
    ".git",
    ".DS_Store",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
}


# ============================================================
# SAFE PATH HANDLING
# ============================================================

def safe_path(path: str) -> Path:
    """
    Resolve a requested path and make absolutely sure that it
    remains inside PROJECT_ROOT.
    """

    requested = Path(path)

    # Allow the model to provide either:
    #   pages/home/home.html
    # or the full absolute path.
    if not requested.is_absolute():
        requested = PROJECT_ROOT / requested

    resolved = requested.resolve()

    try:
        resolved.relative_to(PROJECT_ROOT)
    except ValueError:
        raise PermissionError(
            f"Access denied. The agent may only access:\n"
            f"{PROJECT_ROOT}"
        )

    return resolved


# ============================================================
# TOOLS
# ============================================================

@dataclass
class Tools:

    TOOL_SCHEMA_ATTR: Final[str] = "tool_schema"

    tools: dict[str, Callable[..., Any]] = field(
        default_factory=dict
    )

    # --------------------------------------------------------
    # Convert Python annotations -> JSON schema
    # --------------------------------------------------------

    @staticmethod
    def _annotation_to_schema(annotation: Any) -> dict[str, Any]:

        schema: dict[str, Any] = {"type": "string"}
        description: str | None = None

        origin = get_origin(annotation)

        if origin is Annotated:

            base_type, *meta = get_args(annotation)

            schema = Tools._annotation_to_schema(base_type)

            if meta:
                description = str(meta[0])

        elif annotation in (int, float):

            schema = {"type": "number"}

        elif annotation is bool:

            schema = {"type": "boolean"}

        elif annotation is str:

            schema = {"type": "string"}

        elif annotation is dict:

            schema = {"type": "object"}

        elif annotation is list:

            args = get_args(annotation)

            if args:
                item_schema = Tools._annotation_to_schema(args[0])
            else:
                item_schema = {"type": "string"}

            schema = {
                "type": "array",
                "items": item_schema,
            }

        elif origin is dict:

            schema = {"type": "object"}

        elif origin is list:

            args = get_args(annotation)

            if args:
                item_schema = Tools._annotation_to_schema(args[0])
            else:
                item_schema = {"type": "string"}

            schema = {
                "type": "array",
                "items": item_schema,
            }

        elif origin is Union:

            any_of = [
                Tools._annotation_to_schema(arg)
                for arg in get_args(annotation)
                if arg is not type(None)
            ]

            if any_of:
                schema = any_of[0]

        if description:
            schema["description"] = description

        return schema

    # --------------------------------------------------------
    # Build function schema
    # --------------------------------------------------------

    @classmethod
    def schema_for_callable(
        cls,
        func: Callable[..., Any]
    ) -> dict[str, Any]:

        sig = inspect.signature(func)

        annotations = inspect.get_annotations(func)

        parameters: dict[str, Any] = {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False,
        }

        for name, param in sig.parameters.items():

            annotation = annotations.get(
                name,
                inspect.Parameter.empty
            )

            if annotation is inspect.Parameter.empty:
                annotation = str

            parameters["properties"][name] = (
                cls._annotation_to_schema(annotation)
            )

            if param.default is inspect.Parameter.empty:
                parameters["required"].append(name)

        return {
            "type": "function",
            "function": {
                "name": func.__name__,
                "description": func.__doc__ or "No description provided.",
                "parameters": parameters,
                "strict": True,
            }
        }

    # --------------------------------------------------------
    # Return all schemas
    # --------------------------------------------------------

    def get_schemas(self) -> list[dict[str, Any]]:

        out: list[dict[str, Any]] = []

        for fn in self.tools.values():

            schema = getattr(
                fn,
                self.TOOL_SCHEMA_ATTR,
                None
            )

            if schema is not None:
                out.append(schema)

        return out

    # --------------------------------------------------------
    # Register tool
    # --------------------------------------------------------

    def register(
        self,
        func: Callable[..., Any]
    ) -> Callable[..., Any]:

        if getattr(
            func,
            self.TOOL_SCHEMA_ATTR,
            None
        ) is None:

            setattr(
                func,
                self.TOOL_SCHEMA_ATTR,
                self.schema_for_callable(func)
            )

        self.tools[func.__name__] = func

        return func

    # --------------------------------------------------------
    # Execute tool call
    # --------------------------------------------------------

    def execute(
        self,
        tool_call: dict[str, Any]
    ) -> dict[str, Any]:

        fn_payload = tool_call.get("function") or {}

        fn_name = fn_payload.get("name")

        fn = (
            self.tools.get(fn_name)
            if fn_name
            else None
        )

        if not fn:
            return {
                "error": f"Tool '{fn_name}' not found."
            }

        try:

            # OpenAI-compatible APIs use "arguments"
            arguments = fn_payload.get(
                "arguments",
                "{}"
            )

            args = json.loads(arguments)

            result = fn(**args)

            if isinstance(result, dict):
                return result

            return {
                "result": result
            }

        except KeyboardInterrupt:
            raise

        except Exception as e:

            return {
                "error": str(e)
            }


# ============================================================
# AGENT
# ============================================================

@dataclass
class Agent:

    system_prompt: str = """
You are an expert software engineering agent.

You are working on a real website project.

You have tools that allow you to inspect and modify the project.

IMPORTANT RULES:

1. Always inspect the relevant files before modifying them.

2. Use search_files when you need to locate HTML, CSS,
   JavaScript, or other relevant code.

3. Use read_file to understand the existing implementation.

4. Make the smallest reasonable change necessary.

5. Do not modify unrelated files.

6. Do not invent file contents when you can read the actual file.

7. Preserve the existing coding style.

8. When modifying HTML, CSS, or JavaScript, consider how
   the files interact with each other.

9. After making changes, use git_diff to inspect your changes.

10. You may ONLY access files inside the project directory.

11. Never attempt to access files outside the project.

12. If the user's request is ambiguous, inspect the project
    first and then explain what you found.

You are an autonomous coding agent, not merely a question-answering assistant.
""".strip()

    model: str = "qwen3-coder-30b-a3b-instruct-mlx"

    base_url: str = "http://127.0.0.1:1234/v1"

    api_key: str = field(
        default="NO_API_KEY",
        repr=False
    )

    tools: Tools = field(
        default_factory=Tools
    )

    contexts: dict[str, Callable[[], str]] = field(
        default_factory=dict
    )

    messages: list[dict[str, Any]] = field(
        default_factory=list
    )

    # --------------------------------------------------------
    # Initialization
    # --------------------------------------------------------

    def __post_init__(self) -> None:

        self.base_url = self.base_url.rstrip("/")

    # --------------------------------------------------------
    # Register a tool
    # --------------------------------------------------------

    def tool(
        self,
        func: Callable[..., Any]
    ) -> Callable[..., Any]:

        return self.tools.register(func)

    # --------------------------------------------------------
    # Register context
    # --------------------------------------------------------

    def context(
        self,
        func: Callable[[], str]
    ) -> Callable[[], str]:

        self.contexts[func.__name__] = func

        return func

    # --------------------------------------------------------
    # Chat with model
    # --------------------------------------------------------

    def chat(
        self,
        user_message: str
    ) -> str:

        self.messages.append(
            {
                "role": "user",
                "content": user_message,
            }
        )

        # Build context
        context_parts = []

        for name, fn in self.contexts.items():

            try:

                context_parts.append(
                    f"<context name='{name}'>\n"
                    f"{fn()}\n"
                    f"</context>"
                )

            except Exception as e:

                context_parts.append(
                    f"<context name='{name}'>\n"
                    f"Context error: {e}\n"
                    f"</context>"
                )

        context_content = "\n\n".join(context_parts)

        prefix = [
            {
                "role": "system",
                "content": self.system_prompt,
            }
        ]

        if context_content:

            prefix.append(
                {
                    "role": "system",
                    "content": context_content,
                }
            )

        # ========================================================
        # TOOL-CALLING LOOP
        # ========================================================

        while True:

            api_kwargs = {
                "model": self.model,
                "messages": prefix + self.messages,
                "temperature": 0.2,
            }

            tool_schemas = self.tools.get_schemas()

            if tool_schemas:

                api_kwargs["tools"] = tool_schemas
                api_kwargs["tool_choice"] = "auto"

            url = f"{self.base_url}/chat/completions"

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                url,
                headers=headers,
                json=api_kwargs,
                timeout=300,
            )

            response.raise_for_status()

            data = response.json()

            choices = data.get("choices")

            if not choices:

                raise RuntimeError(
                    "Model response missing choices."
                )

            message = choices[0].get("message")

            if message is None:

                raise RuntimeError(
                    "Model response missing message."
                )

            tool_calls = message.get("tool_calls") or []

            # ====================================================
            # NO TOOL CALLS = FINAL ANSWER
            # ====================================================

            if not tool_calls:

                content = message.get("content") or ""

                self.messages.append(
                    {
                        "role": "assistant",
                        "content": content,
                    }
                )

                return content

            # ====================================================
            # SAVE ASSISTANT TOOL-CALL MESSAGE
            # ====================================================

            self.messages.append(
                {
                    "role": "assistant",
                    "content": message.get("content"),
                    "tool_calls": tool_calls,
                }
            )

            # ====================================================
            # EXECUTE TOOLS
            # ====================================================

            for tool_call in tool_calls:

                function = tool_call.get("function") or {}

                tool_name = function.get(
                    "name",
                    "unknown"
                )

                arguments = function.get(
                    "arguments",
                    "{}"
                )

                print()
                print("=" * 60)
                print(f"🔧 TOOL CALL: {tool_name}")
                print(f"📦 ARGUMENTS: {arguments}")
                print("=" * 60)

                result = self.tools.execute(
                    tool_call
                )

                print(f"📤 TOOL RESULT: {result}")

                self.messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.get("id"),
                        "content": json.dumps(
                            result,
                            ensure_ascii=False
                        ),
                    }
                )
        for tool_call in tool_calls:

            function = tool_call.get("function") or {}

            tool_name = function.get("name", "unknown")

            arguments = function.get("arguments", "{}")

            print()
            print("=" * 60)
            print(f"🔧 TOOL CALL: {tool_name}")
            print(f"📦 ARGUMENTS: {arguments}")
            print("=" * 60)

            result = self.tools.execute(tool_call)

            print(f"📤 TOOL RESULT: {result}")

            self.messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.get("id"),
                    "content": json.dumps(
                        result,
                        ensure_ascii=False
                    ),
                }
            )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    console = Console()

    # --------------------------------------------------------
    # Verify project exists
    # --------------------------------------------------------

    if not PROJECT_ROOT.exists():

        console.print(
            "[red]ERROR:[/red] Project directory does not exist:"
        )

        console.print(
            str(PROJECT_ROOT)
        )

        return

    console.print(
        f"[green]Project:[/green] {PROJECT_ROOT}"
    )

    console.print(
        "[green]Agent filesystem access is restricted to this directory.[/green]"
    )

    console.print()

    # --------------------------------------------------------
    # Create agent
    # --------------------------------------------------------

    agent = Agent(
        model="qwen3-coder-30b-a3b-instruct-mlx"
    )

    # ========================================================
    # CONTEXT
    # ========================================================

    @agent.context
    def project_context() -> str:

        return (
            f"Project root: {PROJECT_ROOT}\n"
            f"Current date/time: "
            f"{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"Current user: {getpass.getuser()}\n"
        )

    # ========================================================
    # TOOL: LIST FILES
    # ========================================================

    @agent.tool
    def list_files(
        directory: Annotated[
            str,
            "Directory inside the project to list. "
            "Use '.' for the project root."
        ]
    ) -> dict[str, Any]:
        """
        List files and directories inside the project.
        """

        directory_path = safe_path(directory)

        if not directory_path.exists():

            return {
                "error": f"Directory does not exist: {directory}"
            }

        if not directory_path.is_dir():

            return {
                "error": f"Not a directory: {directory}"
            }

        results = []

        for item in sorted(directory_path.iterdir()):

            if item.name in IGNORED_DIRECTORIES:
                continue

            relative = item.relative_to(PROJECT_ROOT)

            if item.is_dir():

                results.append(
                    f"[DIR]  {relative}/"
                )

            else:

                results.append(
                    f"[FILE] {relative}"
                )

        return {
            "directory": str(
                directory_path.relative_to(PROJECT_ROOT)
            ),
            "files": results,
        }

    # ========================================================
    # TOOL: READ FILE
    # ========================================================

    @agent.tool
    def read_file(
        path: Annotated[
            str,
            "Path of the file to read, relative to the project root."
        ]
    ) -> dict[str, Any]:
        """
        Read a UTF-8 text file from the project.
        """

        file_path = safe_path(path)

        if not file_path.exists():

            return {
                "error": f"File does not exist: {path}"
            }

        if not file_path.is_file():

            return {
                "error": f"Not a file: {path}"
            }

        # Prevent accidentally loading huge files
        size = file_path.stat().st_size

        if size > 2_000_000:

            return {
                "error": (
                    f"File is too large to read directly "
                    f"({size:,} bytes)."
                )
            }

        try:

            content = file_path.read_text(
                encoding="utf-8"
            )

        except UnicodeDecodeError:

            return {
                "error": (
                    "File is not valid UTF-8 text."
                )
            }

        return {
            "path": str(
                file_path.relative_to(PROJECT_ROOT)
            ),
            "content": content,
        }

    # ========================================================
    # TOOL: SEARCH FILES
    # ========================================================

    @agent.tool
    def search_files(
        directory: Annotated[
            str,
            "Directory inside the project to search."
        ],
        query: Annotated[
            str,
            "Text to search for."
        ]
    ) -> dict[str, Any]:
        """
        Search project text files for a string.
        """

        directory_path = safe_path(directory)

        if not directory_path.exists():

            return {
                "error": f"Directory does not exist: {directory}"
            }

        matches = []

        allowed_extensions = {
            ".html",
            ".htm",
            ".css",
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".json",
            ".md",
            ".txt",
            ".py",
            ".xml",
            ".svg",
        }

        for file_path in directory_path.rglob("*"):

            if not file_path.is_file():
                continue

            # Ignore common generated/dependency directories
            if any(
                part in IGNORED_DIRECTORIES
                for part in file_path.parts
            ):
                continue

            if file_path.suffix.lower() not in allowed_extensions:
                continue

            try:

                content = file_path.read_text(
                    encoding="utf-8"
                )

            except (UnicodeDecodeError, OSError):
                continue

            for line_number, line in enumerate(
                content.splitlines(),
                start=1
            ):

                if query.lower() in line.lower():

                    matches.append(
                        {
                            "file": str(
                                file_path.relative_to(
                                    PROJECT_ROOT
                                )
                            ),
                            "line": line_number,
                            "text": line.strip(),
                        }
                    )

        return {
            "query": query,
            "matches": matches[:200],
            "total_matches": len(matches),
        }

    # ========================================================
    # TOOL: WRITE FILE
    # ========================================================

    @agent.tool
    def write_file(
        path: Annotated[
            str,
            "Path of the file to modify, relative to the project root."
        ],
        content: Annotated[
            str,
            "Complete new contents of the file."
        ]
    ) -> dict[str, Any]:
        """
        Write a text file inside the project.

        The entire file contents must be supplied.
        """

        file_path = safe_path(path)

        # Don't allow writing into ignored directories
        if any(
            part in IGNORED_DIRECTORIES
            for part in file_path.parts
        ):

            return {
                "error": "Writing to this directory is not allowed."
            }

        try:

            file_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            file_path.write_text(
                content,
                encoding="utf-8"
            )

        except Exception as e:

            return {
                "error": str(e)
            }

        return {
            "success": True,
            "path": str(
                file_path.relative_to(PROJECT_ROOT)
            ),
            "bytes_written": len(
                content.encode("utf-8")
            ),
        }

    # ========================================================
    # TOOL: GIT DIFF
    # ========================================================

    @agent.tool
    def git_diff() -> dict[str, Any]:
        """
        Show the current Git diff for the project.
        """

        try:

            result = subprocess.run(
                [
                    "git",
                    "diff",
                    "--",
                ],
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                timeout=30,
            )

            return {
                "success": result.returncode == 0,
                "diff": result.stdout,
                "error": result.stderr,
            }

        except Exception as e:

            return {
                "error": str(e)
            }

    # ========================================================
    # CHAT LOOP
    # ========================================================

    console.print(
        "[bold cyan]AI Madonna Medical Spa Coding Agent[/bold cyan]"
    )

    console.print(
        "[dim]Type :q, quit, or exit to leave.[/dim]"
    )

    console.print()

    while True:

        try:

            console.print(
                "[green]You:[/green] ",
                end=""
            )

            user_input = console.input()

        except KeyboardInterrupt:

            console.print(
                "\n[dim]Goodbye.[/dim]"
            )

            return

        if user_input.strip().lower() in {
            ":q",
            "quit",
            "exit",
        }:

            console.print(
                "[dim]Goodbye.[/dim]"
            )

            return

        if not user_input.strip():
            continue

        try:

            with console.status(
                "[dim]Thinking...[/dim]",
                spinner="dots"
            ):

                response = agent.chat(
                    user_input
                ).strip()

            console.print()

            console.print(
                "[blue]AI Assistant:[/blue]"
            )

            console.print(
                response
            )

            console.print()

        except Exception as e:

            console.print(
                f"[red]Agent error:[/red] {e}"
            )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()