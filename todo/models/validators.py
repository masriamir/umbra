from django.core.validators import RegexValidator


class HexCodeValidator(RegexValidator):
    def __init__(self) -> None:
        super().__init__(regex=r"^#([0-9A-Fa-f]{3}){1,2}$")
