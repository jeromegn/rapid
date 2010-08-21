
test:
	@./support/expresso/bin/expresso \
		-I lib \
		--serial \
		test/*.test.js

.PHONY: test