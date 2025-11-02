from typing import Any, Dict, List

from business_rules import run_all
from business_rules.actions import BaseActions, rule_action
from business_rules.variables import BaseVariables, boolean_rule_variable, numeric_rule_variable, string_rule_variable


class RuleEngineWrapper:
    """
    A wrapper for the business-rules library to provide a simplified interface
    and translate the output to a standardized format.
    """

    def run(self, data_to_validate: Dict[str, Any], rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Runs the business rules against the provided data and returns a list of results.

        :param data_to_validate: A dictionary containing the data to be validated.
        :param rules: A list of rules in the format expected by the business-rules library.
        :return: A list of dictionaries, where each dictionary represents the result of a rule.
        """
        class DataVariables(BaseVariables):
            def __init__(self, data):
                self.data = data
                for key, value in data.items():
                    if isinstance(value, bool):
                        setattr(self, key, self.boolean_variable(value))
                    elif isinstance(value, (int, float)):
                        setattr(self, key, self.numeric_variable(value))
                    else:
                        setattr(self, key, self.string_variable(value))

            def boolean_variable(self, value):
                @boolean_rule_variable()
                def func():
                    return value
                return func

            def numeric_variable(self, value):
                @numeric_rule_variable()
                def func():
                    return value
                return func

            def string_variable(self, value):
                @string_rule_variable()
                def func():
                    return value
                return func

        class NoActions(BaseActions):
            @rule_action()
            def result(self):
                pass

        results = []
        for rule in rules:
            rule_name = rule.get("name", "unnamed_rule")
            level = rule.get("level", "blocker")
            message = rule.get("message", "")

            triggered = run_all(
                rule_list=[{"conditions": rule["conditions"], "actions": [{"name": "result", "params": {}}]}],
                defined_variables=DataVariables(data_to_validate),
                defined_actions=NoActions(),
                stop_on_first_trigger=False
            )

            status = "pass" if triggered else "fail"

            results.append({
                "rule_name": rule_name,
                "status": status,
                "level": level,
                "message": message,
            })

        return results
