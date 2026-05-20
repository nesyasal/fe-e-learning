from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from pathlib import Path


BASE_URL = (Path(__file__).resolve().parents[1] / "index.html").as_uri()

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--window-size=1200,800")

service = Service(ChromeDriverManager().install())
with webdriver.Chrome(service=service, options=options) as driver:
    driver.get(BASE_URL)
    driver.implicitly_wait(5)
    print('title=', driver.title)
    print('login link present=', driver.execute_script("""return !!document.querySelector('a[href="#test-form"]');"""))
    print('header html snippet=', driver.execute_script("""return document.querySelector('#header')?.innerHTML || 'NONE';"""))
    try:
        logs = driver.get_log('browser')
    except Exception as e:
        logs = [f'log error: {e}']
    print('console logs=', logs)
