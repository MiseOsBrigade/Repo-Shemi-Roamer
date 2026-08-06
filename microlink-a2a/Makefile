.PHONY: test demo package

test:
	python3 -m unittest discover -s tests -v

demo:
	PYTHONPATH=src python3 examples/demo.py

package:
	cd .. && zip -qr miseos-microlink-a2a.zip miseos-microlink-a2a
