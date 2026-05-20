from pathlib import Path
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from time import time

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WAIT_TIME = 15


@contextmanager
def local_server():
    handler = partial(SimpleHTTPRequestHandler, directory=str(PROJECT_ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        host, port = server.server_address
        yield f"http://{host}:{port}/index.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def create_driver(headless: bool = False) -> webdriver.Chrome:
    chrome_options = Options()
    chrome_options.add_argument("--window-size=1366,900")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")

    if headless:
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")

    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def wait(driver: webdriver.Chrome, seconds: int = WAIT_TIME) -> WebDriverWait:
    return WebDriverWait(driver, seconds)


def open_page(driver: webdriver.Chrome, url: str) -> None:
    driver.get(url)
    wait(driver).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    driver.execute_script("window.localStorage.clear();")
    driver.refresh()
    wait(driver).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    wait(driver).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'a.login[href="#test-form"]'))
    )


def open_modal(driver: webdriver.Chrome, form_id: str) -> None:
    if form_id not in {"test-form", "test-form2"}:
        raise ValueError(f"Unknown modal form id: {form_id}")

    selector = f"#{form_id}"

    driver.execute_script(
        """
        const selector = arguments[0];

        if (window.jQuery && window.jQuery.magnificPopup) {
          window.jQuery.magnificPopup.close();
          window.jQuery.magnificPopup.open({
            items: { src: selector, type: "inline" },
            type: "inline",
            preloader: false
          });
          return;
        }

        const form = document.querySelector(selector);
        if (form) {
          form.classList.remove("mfp-hide");
          form.style.display = "block";
        }
        """,
        selector,
    )

    wait(driver).until(
        lambda d: d.execute_script(
            """
            const form = document.querySelector(arguments[0]);
            if (!form) return false;
            const rect = form.getBoundingClientRect();
            const style = window.getComputedStyle(form);
            return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
            """,
            selector,
        )
    )


def set_input(form, css_selector: str, value: str) -> None:
    field = form.find_element(By.CSS_SELECTOR, css_selector)
    field.clear()
    field.send_keys(value)


def close_swal_if_present(driver: webdriver.Chrome, seconds: int = 5) -> str | None:
    try:
        popup = WebDriverWait(driver, seconds).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".swal2-popup"))
        )
        message = popup.text
        driver.find_element(By.CSS_SELECTOR, ".swal2-confirm").click()
        WebDriverWait(driver, seconds).until(
            EC.invisibility_of_element_located((By.CSS_SELECTOR, ".swal2-popup"))
        )
        return message
    except TimeoutException:
        return None


def register_user(
    driver: webdriver.Chrome,
    full_name: str,
    username: str,
    email: str,
    password: str,
) -> None:
    open_modal(driver, "test-form2")
    form = driver.find_element(By.CSS_SELECTOR, "form#test-form2")

    set_input(form, "#full_name", full_name)
    set_input(form, "#username", username)
    set_input(form, "#email", email)
    set_input(form, "#password", password)

    form.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    wait(driver).until(
        lambda d: not form.find_element(By.CSS_SELECTOR, "button[type='submit']").get_attribute(
            "disabled"
        )
    )

    swal_text = close_swal_if_present(driver)
    if swal_text and "gagal" in swal_text.lower():
        raise AssertionError(f"Register failed: {swal_text}")


def login_user(driver: webdriver.Chrome, email: str, password: str) -> str:
    open_modal(driver, "test-form")
    form = driver.find_element(By.CSS_SELECTOR, "form#test-form")

    set_input(form, "#email", email)
    set_input(form, "#password", password)

    form.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    try:
        token = wait(driver).until(
            lambda d: d.execute_script("return window.localStorage.getItem('token');")
        )
    except TimeoutException as exc:
        swal_text = close_swal_if_present(driver, seconds=1)
        if swal_text:
            raise AssertionError(f"Login failed: {swal_text}") from exc
        raise AssertionError("Login failed: token was not saved in localStorage.") from exc

    user_json = driver.execute_script("return window.localStorage.getItem('user');")
    if not user_json:
        raise AssertionError("Login succeeded, but user data was not saved in localStorage.")

    return token


def test_register_and_login() -> None:
    unique = int(time())
    email = f"seleniumuser{unique}@example.com"
    username = f"seleniumuser{unique}"
    password = "TestPass123"

    driver = create_driver(headless=True)
    try:
        with local_server() as base_url:
            open_page(driver, base_url)

            register_user(
                driver,
                full_name="Selenium Tester",
                username=username,
                email=email,
                password=password,
            )

            token = login_user(driver, email=email, password=password)
            assert token
    finally:
        driver.quit()


if __name__ == "__main__":
    unique = int(time())
    email = f"seleniumuser{unique}@example.com"
    username = f"seleniumuser{unique}"
    password = "TestPass123"

    driver = create_driver()
    try:
        with local_server() as base_url:
            open_page(driver, base_url)
            print("=== Register test ===")
            register_user(driver, "Selenium Tester", username, email, password)

            print("=== Login test ===")
            token = login_user(driver, email, password)
            print("Login succeeded, token found in localStorage.")
            print("token=", token)
    finally:
        driver.quit()
