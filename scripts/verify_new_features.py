from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless=new')
options.add_argument('--window-size=1440,960')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.binary_location = r'C:\Users\prana\AppData\Local\Google\Chrome\Application\chrome.exe'

driver = webdriver.Chrome(options=options)

# 1. Load Home Page with over-map filter
driver.get('http://localhost:5173/')
time.sleep(3)
driver.save_screenshot('screenshot_new_home.png')
print('Captured screenshot_new_home.png')

# 2. Click on Critical in the Risk Level Legend
legend_rows = driver.find_elements(By.XPATH, "//*[contains(text(), 'Critical')]")
critical_row = None
for r in legend_rows:
    # find row that is clickable in legend
    parent = r
    for _ in range(3):
        if parent:
            if 'cursor-pointer' in (parent.get_attribute('class') or ''):
                critical_row = parent
                break
            parent = parent.find_element(By.XPATH, '..')
    if critical_row:
        break

if critical_row:
    critical_row.click()
    time.sleep(2)
    driver.save_screenshot('screenshot_legend_critical_clicked.png')
    print('Captured screenshot_legend_critical_clicked.png')
else:
    print('Could not find critical legend row')

# 3. Hover over a dot on the map to trigger hover tooltip
# Reset risk band first
driver.get('http://localhost:5173/')
time.sleep(3)

# Find Leaflet circle marker paths on canvas or SVG
# Since preferCanvas is true, circleMarkers are rendered on canvas.
# But Leaflet's canvas triggers hover on mousemove over the canvas coordinates!
canvas = driver.find_element(By.CSS_SELECTOR, '.leaflet-pane canvas')
if canvas:
    # Hover near the center of India (approx center of the canvas)
    actions = ActionChains(driver)
    # Move to center of canvas where many thermal points exist
    actions.move_to_element(canvas).perform()
    time.sleep(0.5)

    # Move slightly around center to find a dot
    for dx, dy in [(0, 0), (20, 30), (-40, 50), (60, -20), (-10, -50), (100, 20)]:
        actions.move_to_element_with_offset(canvas, dx, dy).perform()
        time.sleep(0.5)
        # Check if tooltip appeared
        tooltips = driver.find_elements(By.CSS_SELECTOR, '.gov-tooltip')
        if tooltips and any(t.is_displayed() for t in tooltips):
            print(f'Tooltip displayed at offset ({dx}, {dy})!')
            break

    time.sleep(1)
    driver.save_screenshot('screenshot_dot_hover_tooltip.png')
    print('Captured screenshot_dot_hover_tooltip.png')

driver.quit()
print('All verifications finished!')
