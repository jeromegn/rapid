
test:
	@./support/expresso/bin/expresso \
		-I lib \
		--serial \
		$(TEST_FLAGS) \
		test/*.test.js

test-cov:
	@$(MAKE) TEST_FLAGS="--cov"

.PHONY: test