from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless=new')
options.add_argument('--window-size=1440,1080')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.binary_location = r'C:\Users\prana\AppData\Local\Google\Chrome\Application\chrome.exe'

driver = webdriver.Chrome(options=options)
pages = [
    ('/', 'home'),
    ('/analytics', 'analytics'),
    ('/alerts', 'alerts'),
    ('/explainability', 'explainability'),
    ('/contact', 'contact'),
    ('/report', 'report')
]

for path, name in pages:
    url = f'http://localhost:5173{path}'
    driver.get(url)
    time.sleep(2)
    driver.save_screenshot(f'screenshot_light_{name}.png')
    print(f'Captured screenshot_light_{name}.png')

driver.quit()
print('All 6 light theme screenshots captured!')
