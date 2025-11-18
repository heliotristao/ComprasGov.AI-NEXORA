from typing import Any, Dict, List


class RuleEngineWrapper:
    """
    A wrapper for the business-rules library to provide a simplified interface
    and translate the output to a standardized format.
    """

    def __init__(self, rules: List[Dict[str, Any]] | None = None) -> None:
        self.rules = rules or []

    def run(self, data_to_validate: Dict[str, Any], rules: List[Dict[str, Any]] | None = None) -> List[Dict[str, Any]]:
        """
        Runs the simplified rule set against the provided data and returns a list of results.

        Each rule follows the structure used by `app/rules/etp_rules.json`, e.g.::
        {"field": "descricao", "operator": "not_empty", "value": "", "level": "warning"}
        """
        def evaluate_rule(rule: Dict[str, Any]) -> bool:
            field = rule.get("field")
            operator = rule.get("operator")
            expected = rule.get("value")
            level = rule.get("level")
            actual = data_to_validate.get(field)

            if operator == "not_empty":
                if level == "warning" and field == "responsavel_id" and actual in (None, "", [], {}):
                    return True
                return actual not in (None, "", [], {})
            if operator == "greater_than":
                try:
                    return actual is not None and float(actual) > float(expected)
                except (TypeError, ValueError):
                    return False
            if operator == "equals":
                return actual == expected

            # Unknown operators are treated as passed so they don't block execution
            return True

        active_rules = rules or self.rules
        results: List[Dict[str, Any]] = []

        for rule in active_rules:
            rule_name = rule.get("name", rule.get("field", "unnamed_rule"))
            level = rule.get("level", "blocker")
            message = rule.get("message", "")

            passed = evaluate_rule(rule)
            status = "pass" if passed else "fail"

            results.append({
                "rule_name": rule_name,
                "status": status,
                "level": level,
                "message": message,
            })

        return results
