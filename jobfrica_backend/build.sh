#!/usr/bin/env bash
# exit on error
set -o errexit # exit on error
set -o pipefail # don't hide errors within pipes
set -o nounset # exit on undefined variable
pip install -r requirements.txt


python manage.py collectstatic --no-input

python manage.py makemigrations --no-input

python manage.py migrate --no-input

echo "Build complete!"