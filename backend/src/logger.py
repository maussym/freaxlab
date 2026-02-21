import logging
import sys

# Настраиваем формат и уровень
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    stream=sys.stdout
)

logger = logging.getLogger("qazcode_backend")
