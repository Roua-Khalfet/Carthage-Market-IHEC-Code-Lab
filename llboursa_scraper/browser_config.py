from browser_use import Browser
# BrowserProfile is available via browser_use.browser.profile or likely lazy imported in __init__
# Attempting direct import to be safe, or looking at the previous file view it was lazy imported as BrowserProfile.
from browser_use.browser.profile import BrowserProfile

def get_local_browser() -> Browser:
    """
    Returns a Browser instance configured for local execution.
    Runs in headless mode to not disturb the user.
    """
    return Browser(browser_profile=BrowserProfile(headless=True))
