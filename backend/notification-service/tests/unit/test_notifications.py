import unittest
from unittest.mock import patch, MagicMock
from app.core.notifications import NotificationService

class TestNotificationService(unittest.TestCase):

    @patch('app.core.notifications.Environment')
    def test_get_template_content(self, mock_environment):
        # Arrange
        mock_template = MagicMock()
        mock_template.render.return_value = "<html><body>Hello Test ETP</body></html>"

        mock_env_instance = MagicMock()
        mock_env_instance.get_template.return_value = mock_template
        mock_environment.return_value = mock_env_instance

        service = NotificationService()

        context = {"etp_name": "Test ETP"}

        # Act
        subject, html_content = service.get_template_content("etp_approved", context)

        # Assert
        self.assertEqual(subject, "Seu ETP 'Test ETP' foi aprovado.")
        self.assertEqual(html_content, "<html><body>Hello Test ETP</body></html>")
        mock_env_instance.get_template.assert_called_with("etp_approved.html")
        mock_template.render.assert_called_with(**context)

if __name__ == '__main__':
    unittest.main()
