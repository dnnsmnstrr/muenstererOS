from playwright.sync_api import sync_playwright

def test_instant_update(page):
    # Enable debugging to see console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    page.goto("http://localhost:5173/settings")
    page.wait_for_load_state("networkidle")

    # Take screenshot of English version
    page.screenshot(path="settings_en.png")

    # Try to find 'Language' text
    print("Page content length:", len(page.content()))

    # Change to German using the button
    page.click("#de")
    print("Clicked #de")

    # Wait a bit
    page.wait_for_timeout(1000)

    # Take screenshot of German version
    page.screenshot(path="settings_de.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_instant_update(page)
        finally:
            browser.close()
