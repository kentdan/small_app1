from markitdown import MarkItDown


def convert_to_markdown(file_path: str) -> str:
    md = MarkItDown()
    result = md.convert(file_path)
    return result.text_content or ""
