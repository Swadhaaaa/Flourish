import requests
import json

url = "http://localhost:8000/api/ai/burnout-prediction"

payload = {
    "Age": 30,
    "Gender": "Female",
    "Country": "USA",
    "JobRole": "Developer",
    "Department": "Tech",
    "YearsAtCompany": 3,
    "TeamSize": 10,
    "SalaryRange": "Medium",
    "WorkHoursPerWeek": 55, # High
    "RemoteWork": 0,
    "CommuteTime": 60,
    "ScheduleFlexibilityScore": 3,
    "CanAdjustWorkHours": 0,
    "DependentsCount": 2,
    "CareHoursPerWeek": 20,
    "JobSatisfaction": 4,
    "StressLevel": 8,
    "SleepHours": 5.0,
    "PhysicalActivityHrs": 1.0,
    "HasMentalHealthSupport": 0,
    "HasTherapyAccess": 0,
    "MentalHealthDaysTaken": 5,
    "ManagerSupportScore": 3,
    "FeelsSafeRaisingConcerns": 0,
    "WorkplaceInclusionScore": 4,
    "ProductivityScore": 6,
    "CareerGrowthScore": 4,
    "WorkLifeBalanceScore": 3
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
