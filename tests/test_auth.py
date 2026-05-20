from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "file:///d:/kuliah/proyek3/fe-e-learning/index.html"
# Jika Anda menjalankan server lokal, gunakan URL seperti:
# BASE_URL = "http://localhost:8000/index.html"


def create_driver() -> webdriver.Chrome:
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--ignore-certificate-errors")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def open_page(driver: webdriver.Chrome, url: str) -> None:
    driver.get(url)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))


def click_element(driver: webdriver.Chrome, selector: str) -> None:
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
    )
    driver.execute_script("document.querySelector(arguments[0]).click();", selector)


def open_modal(driver: webdriver.Chrome, form_id: str) -> None:
    if form_id == "test-form":
        selector = 'header a.login[href="#test-form"]'
        WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
        )
        click_element(driver, selector)
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "form#test-form"))
        )
    elif form_id == "test-form2":
        # The registration form is opened via the "Sign Up" link inside the login modal.
        open_modal(driver, "test-form")
        signup_selector = "a.dont-hav-acc[href='#test-form2']"
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, signup_selector))
        )
        click_element(driver, signup_selector)
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "form#test-form2"))
        )
    else:
        raise ValueError(f"Unknown modal form id: {form_id}")


def register_user(driver: webdriver.Chrome, full_name: str, username: str, email: str, password: str) -> None:
    open_modal(driver, "test-form2")
    form = driver.find_element(By.CSS_SELECTOR, "form#test-form2")

    form.find_element(By.CSS_SELECTOR, "input#full_name").send_keys(full_name)
    form.find_element(By.CSS_SELECTOR, "input#username").send_keys(username)
    form.find_element(By.CSS_SELECTOR, "input#email").send_keys(email)
    form.find_element(By.CSS_SELECTOR, "input#password").send_keys(password)

    submit = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit.click()

    try:
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        alert = driver.switch_to.alert
        print("Register alert:", alert.text)
        alert.accept()
    except TimeoutException:
        print("No JS alert found after register; continuing.")

    try:
        WebDriverWait(driver, 10).until_not(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "form#test-form2"))
        )
    except TimeoutException:
        print("Register form may still be visible; backend may not have responded or modal did not close.")


def login_user(driver: webdriver.Chrome, email: str, password: str) -> None:
    open_modal(driver, "test-form")
    form = driver.find_element(By.CSS_SELECTOR, "form#test-form")

    form.find_element(By.CSS_SELECTOR, "input#email").send_keys(email)
    form.find_element(By.CSS_SELECTOR, "input#password").send_keys(password)

    submit = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit.click()

    try:
        token = WebDriverWait(driver, 10).until(
            lambda d: d.execute_script("return window.localStorage.getItem('token');")
        )
        print("Login succeeded, token found in localStorage.")
        print("token=", token)
    except TimeoutException:
        print("Login did not set token in localStorage within timeout.")
        try:
            WebDriverWait(driver, 5).until(EC.alert_is_present())
            alert = driver.switch_to.alert
            print("Login alert:", alert.text)
            alert.accept()
        except TimeoutException:
            raise RuntimeError("Login failed or no response from backend.")


if __name__ == "__main__":
    driver = create_driver()
    try:
        open_page(driver, BASE_URL)

        print("=== Register test ===")
        register_user(
            driver,
            full_name="Selenium Tester",
            username="selenium_user_123",
            email="selenium_user_123@example.com",
            password="TestPass123",
        )

        print("=== Login test ===")
        login_user(driver, email="selenium_user_123@example.com", password="TestPass123")

    finally:
        driver.quit()
