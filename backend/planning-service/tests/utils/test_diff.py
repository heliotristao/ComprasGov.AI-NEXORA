from app.utils.diff import generate_diff


def test_generate_diff_addition():
    text_before = "hello world"
    text_after = "hello beautiful world"
    diff = generate_diff(text_before, text_after)
    assert "+beautiful" in diff

def test_generate_diff_deletion():
    text_before = "hello beautiful world"
    text_after = "hello world"
    diff = generate_diff(text_before, text_after)
    assert "-beautiful" in diff

def test_generate_diff_truncation():
    text_before = "a" * 3000
    text_after = "b" * 3000
    diff = generate_diff(text_before, text_after)
    assert len(diff) == 2048
