MOCHA=./node_modules/mocha/bin/mocha
REPORTER=spec

test:
	$(MOCHA) --reporter $(REPORTER)

.PHONY: test