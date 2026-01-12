import json
from ai_service import AIService

def test_reflection_analysis():
    ai = AIService()
    
    # Test Case 1: High Stress / Burnout
    text_burnout = "I am feeling absolutely terrible. I want to quit. The pressure is too much and I can't sleep at all. I hate this job."
    result_burnout = ai.analyze_work_reflection(text_burnout)
    print("\n--- Test Case 1: Burnout ---")
    print(f"Text: {text_burnout}")
    print(json.dumps(result_burnout, indent=2))
    assert result_burnout["metrics"]["BurnoutRisk"] == "High", "Should be High risk"

    # Test Case 2: Positive / Accomplished
    text_positive = "Today was a great win! I felt so supported by my team and we accomplished a lot. I am excited for tomorrow."
    result_positive = ai.analyze_work_reflection(text_positive)
    print("\n--- Test Case 2: Positive ---")
    print(f"Text: {text_positive}")
    print(json.dumps(result_positive, indent=2))
    assert result_positive["metrics"]["JobSatisfaction"] > 7, "Should have high satisfaction"

    # Test Case 3: Neutral / Mixed
    text_neutral = "It was a busy day, handled some emails and meetings. Nothing special."
    result_neutral = ai.analyze_work_reflection(text_neutral)
    print("\n--- Test Case 3: Neutral ---")
    print(f"Text: {text_neutral}")
    print(json.dumps(result_neutral, indent=2))

if __name__ == "__main__":
    try:
        test_reflection_analysis()
        print("\n✅ All reflection tests passed!")
    except AssertionError as e:
        print(f"\n❌ Test Failed: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
