import pytest
from app.core.rule_engine_wrapper import RuleEngineWrapper


@pytest.fixture
def rule_engine():
    return RuleEngineWrapper()


def test_run_with_passing_rule(rule_engine):
    """
    Tests a single rule that should pass.
    The rule checks if age is greater than 18.
    """
    data_to_validate = {"age": 20}
    rules = [
        {
            "name": "age_check_pass",
            "level": "blocker",
            "message": "User must be over 18.",
            "conditions": {
                "all": [
                    {
                        "name": "age",
                        "operator": "greater_than",
                        "value": 18,
                    }
                ]
            },
        }
    ]

    results = rule_engine.run(data_to_validate, rules)

    assert len(results) == 1
    result = results[0]
    assert result["rule_name"] == "age_check_pass"
    assert result["status"] == "pass"
    assert result["level"] == "blocker"
    assert result["message"] == "User must be over 18."


def test_run_with_failing_rule(rule_engine):
    """
    Tests a single rule that should fail.
    The rule checks if age is greater than 18.
    """
    data_to_validate = {"age": 17}
    rules = [
        {
            "name": "age_check_fail",
            "level": "blocker",
            "message": "User must be over 18.",
            "conditions": {
                "all": [
                    {
                        "name": "age",
                        "operator": "greater_than",
                        "value": 18,
                    }
                ]
            },
        }
    ]

    results = rule_engine.run(data_to_validate, rules)

    assert len(results) == 1
    result = results[0]
    assert result["rule_name"] == "age_check_fail"
    assert result["status"] == "fail"
    assert result["level"] == "blocker"
    assert result["message"] == "User must be over 18."


def test_run_with_multiple_rules_mixed_results(rule_engine):
    """
    Tests multiple rules with both passing and failing results.
    """
    data_to_validate = {"age": 20, "country": "US"}
    rules = [
        {
            "name": "age_check",
            "level": "blocker",
            "message": "User must be over 18.",
            "conditions": {
                "all": [
                    {"name": "age", "operator": "greater_than", "value": 18}
                ]
            },
        },
        {
            "name": "country_check",
            "level": "warning",
            "message": "User must be from Brazil.",
            "conditions": {
                "all": [
                    {"name": "country", "operator": "equal_to", "value": "BR"}
                ]
            },
        },
    ]

    results = rule_engine.run(data_to_validate, rules)

    assert len(results) == 2

    age_result = next(r for r in results if r['rule_name'] == 'age_check')
    country_result = next(r for r in results if r['rule_name'] == 'country_check')

    assert age_result["status"] == "pass"
    assert country_result["status"] == "fail"
    assert country_result["level"] == "warning"

def test_run_with_no_rules(rule_engine):
    """
    Tests that running with no rules returns an empty list.
    """
    data_to_validate = {"age": 20}
    rules = []
    results = rule_engine.run(data_to_validate, rules)
    assert results == []

def test_run_with_unnamed_rule(rule_engine):
    """
    Tests a rule without a name to ensure it gets a default name.
    """
    data_to_validate = {"age": 25}
    rules = [{
        "conditions": {
            "all": [{"name": "age", "operator": "greater_than", "value": 18}]
        }
    }]
    results = rule_engine.run(data_to_validate, rules)
    assert results[0]['rule_name'] == 'unnamed_rule'
