from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless=new')
options.add_argument('--window-size=1440,960')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.binary_location = r'C:\Users\prana\AppData\Local\Google\Chrome\Application\chrome.exe'

driver = webdriver.Chrome(options=options)

# 1. Home landing page with vertical stats & map
driver.get('http://localhost:5173/')
time.sleep(3)
driver.save_screenshot('screenshot_minimalist_home.png')
print('Captured screenshot_minimalist_home.png')

# 2. Toggle Heatmap checkbox
checkboxes = driver.find_elements('css selector', 'input[type="checkbox"]')
if checkboxes:
    checkboxes[0].click()
    time.sleep(3)
    driver.save_screenshot('screenshot_home_heatmap.png')
    print('Captured screenshot_home_heatmap.png')

# 3. Dedicated Threat Profiles & Pipeline page
driver.get('http://localhost:5173/threat-profiles')
time.sleep(3)
driver.save_screenshot('screenshot_threat_profiles_page.png')
print('Captured screenshot_threat_profiles_page.png')

driver.quit()
print('Verification script finished!')
