import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

class BurnoutPredictor:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(self.base_dir, "data")
        self.models_dir = os.path.join(self.base_dir, "models")
        self.data_path = os.path.join(self.data_dir, "women_worklife_burnout_synthetic.csv")
        self.model_path = os.path.join(self.models_dir, "burnout_prediction_model.pkl")
        
        # Ensure directories exist
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.models_dir, exist_ok=True)
        
        self.model = self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                return joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading model: {e}")
                return None
        return None

    def generate_synthetic_data(self):
        print("Generating synthetic data...")
        np.random.seed(42)
        n = 3000

        df = pd.DataFrame({
            "EmployeeID": range(1001, 1001 + n),
            "Age": np.random.randint(22, 60, n),
            "Gender": ["Female"] * n,
            "Country": np.random.choice(["India", "USA", "UK", "Germany", "Canada"], n),
            "JobRole": np.random.choice(["Developer", "Analyst", "Manager", "HR", "Designer"], n),
            "Department": np.random.choice(["Tech", "Finance", "HR", "Operations"], n),
            "YearsAtCompany": np.random.randint(0, 30, n),
            "TeamSize": np.random.randint(3, 25, n),
            "SalaryRange": np.random.choice(["Low", "Medium", "High"], n, p=[0.4, 0.4, 0.2]),
            "WorkHoursPerWeek": np.random.randint(32, 65, n),
            "RemoteWork": np.random.choice([0, 1], n, p=[0.45, 0.55]),
            "CommuteTime": np.random.randint(0, 120, n),
            "ScheduleFlexibilityScore": np.random.randint(1, 11, n),
            "CanAdjustWorkHours": np.random.choice([0, 1], n, p=[0.4, 0.6]),
            "DependentsCount": np.random.choice([0, 1, 2, 3], n, p=[0.3, 0.3, 0.25, 0.15]),
            "CareHoursPerWeek": np.random.randint(0, 40, n),
            "JobSatisfaction": np.random.randint(1, 11, n),
            "StressLevel": np.random.randint(1, 11, n),
            "SleepHours": np.round(np.random.uniform(4.5, 8.5, n), 1),
            "PhysicalActivityHrs": np.round(np.random.uniform(0, 6, n), 1),
            "HasMentalHealthSupport": np.random.choice([0, 1], n, p=[0.4, 0.6]),
            "HasTherapyAccess": np.random.choice([0, 1], n, p=[0.5, 0.5]),
            "MentalHealthDaysTaken": np.random.randint(0, 15, n),
            "ManagerSupportScore": np.random.randint(1, 11, n),
            "FeelsSafeRaisingConcerns": np.random.choice([0, 1], n, p=[0.35, 0.65]),
            "WorkplaceInclusionScore": np.random.randint(1, 11, n),
            "ProductivityScore": np.random.randint(1, 11, n),
            "CareerGrowthScore": np.random.randint(1, 11, n),
            "WorkLifeBalanceScore": np.random.randint(1, 11, n),
        })

        burnout_score = (
            df["WorkHoursPerWeek"] * 0.25 +
            df["CareHoursPerWeek"] * 0.35 +
            df["StressLevel"] * 4 -
            df["SleepHours"] * 4 -
            df["ScheduleFlexibilityScore"] * 2 -
            df["ManagerSupportScore"] * 2 -
            df["WorkLifeBalanceScore"] * 3
        )

        df["BurnoutRisk"] = (burnout_score > np.percentile(burnout_score, 65)).astype(int)
        df.to_csv(self.data_path, index=False)
        print(f"Data saved to {self.data_path}")
        return df

    def train_model(self):
        if not os.path.exists(self.data_path):
            self.generate_synthetic_data()
        
        print("Training model...")
        df = pd.read_csv(self.data_path)
        
        if "EmployeeID" in df.columns:
            df = df.drop(columns=["EmployeeID"])

        X = df.drop("BurnoutRisk", axis=1)
        y = df["BurnoutRisk"]

        num_cols = X.select_dtypes(include=["int64", "float64"]).columns
        cat_cols = X.select_dtypes(include=["object"]).columns

        preprocessor = ColumnTransformer([
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
        ])

        # Using Gradient Boosting as it likely performs best, but we could iterate
        model = GradientBoostingClassifier(random_state=42)
        
        pipe = Pipeline([
            ("prep", preprocessor),
            ("model", model)
        ])

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )

        pipe.fit(X_train, y_train)
        
        preds = pipe.predict(X_test)
        f1 = f1_score(y_test, preds)
        print(f"Model Trained. F1 Score: {f1:.4f}")

        joblib.dump(pipe, self.model_path)
        self.model = pipe
        print(f"Model saved to {self.model_path}")
        return {"status": "success", "f1_score": f1}

    def predict(self, input_data: dict):
        if self.model is None:
            # Auto-train if missing
            print("Model not found, training new one...")
            self.train_model()
            
        input_df = pd.DataFrame([input_data])
        
        # Ensure correct types for numeric columns if they come in as strings
        numeric_fields = [
            "Age", "YearsAtCompany", "TeamSize", "WorkHoursPerWeek", "RemoteWork", 
            "CommuteTime", "ScheduleFlexibilityScore", "CanAdjustWorkHours", 
            "DependentsCount", "CareHoursPerWeek", "JobSatisfaction", "StressLevel", 
            "SleepHours", "PhysicalActivityHrs", "HasMentalHealthSupport", 
            "HasTherapyAccess", "MentalHealthDaysTaken", "ManagerSupportScore", 
            "FeelsSafeRaisingConcerns", "WorkplaceInclusionScore", "ProductivityScore", 
            "CareerGrowthScore", "WorkLifeBalanceScore"
        ]
        
        for field in numeric_fields:
            if field in input_df.columns:
                input_df[field] = pd.to_numeric(input_df[field], errors='coerce')

        prediction = self.model.predict(input_df)[0]
        probability = self.model.predict_proba(input_df)[0][1]
        
        # --- Heuristic Override for Safety ---
        # If indicators are critically high, force High Risk regardless of model
        stress = input_df["StressLevel"].iloc[0] if "StressLevel" in input_df.columns else 5
        sleep = input_df["SleepHours"].iloc[0] if "SleepHours" in input_df.columns else 7
        manager_support = input_df["ManagerSupportScore"].iloc[0] if "ManagerSupportScore" in input_df.columns else 7
        
        is_critical = False
        if stress >= 8:
            is_critical = True
        if sleep < 5.5 and stress > 6:
            is_critical = True
        if manager_support < 3 and stress > 6:
            is_critical = True
            
        if is_critical:
            prediction = 1
            probability = max(probability, 0.85 + (stress / 100.0)) # Ensure > 85%
            
        return {
            "burnout_risk": "High" if prediction == 1 else "Low",
            "probability": float(probability),
            "is_high_risk": bool(prediction == 1)
        }
