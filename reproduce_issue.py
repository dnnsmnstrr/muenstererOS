from playwright.sync_api import sync_playwright, expect

def test_instant_update(page):
    page.goto("http://localhost:5173/settings")

    # Check initial English text
    expect(page.get_by_role("heading", name="Language")).to_be_visible()
    print("Initial English heading 'Language' found.")

    # Change to German
    # We use the ID #de which we know from the code
    page.click("#de")
    print("Clicked German radio button.")

    # Check if it updates to 'Sprache' without reload
    try:
        expect(page.get_by_role("heading", name="Sprache")).to_be_visible()
        print("Heading updated to 'Sprache' immediately.")
    except Exception as e:
        print("Heading did NOT update to 'Sprache' immediately.")
        # Take a screenshot to see what's happening
        page.screenshot(path="failed_instant_update.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_instant_update(page)
        finally:
            browser.close()
