# [3.1.0](https://github.com/LabShare/data-structures/compare/v3.0.0...v3.1.0) (2019-01-11)


### Bug Fixes

* allow 2 classes in the same file ([bd3af09](https://github.com/LabShare/data-structures/commit/bd3af09))
* avoid dependency cycle ([90cb4de](https://github.com/LabShare/data-structures/commit/90cb4de))
* improve performance for removeHashes ([85c650e](https://github.com/LabShare/data-structures/commit/85c650e))
* remove nsp ([8f8ac9a](https://github.com/LabShare/data-structures/commit/8f8ac9a))
* remove underscore from method name ([e0c3bcd](https://github.com/LabShare/data-structures/commit/e0c3bcd))
* replace nsp check with npm audit ([7fa43c2](https://github.com/LabShare/data-structures/commit/7fa43c2))


### Features

* add _getSignature method ([f6b2466](https://github.com/LabShare/data-structures/commit/f6b2466))
* add edges forEach method ([b493d71](https://github.com/LabShare/data-structures/commit/b493d71))
* add nodes findOne method ([3b21f5f](https://github.com/LabShare/data-structures/commit/3b21f5f))
* add nodes size method ([5337934](https://github.com/LabShare/data-structures/commit/5337934))

# [3.0.0](https://github.com/LabShare/data-structures.git/compare/v2.0.0...v3.0.0) (2018-10-30)


### Bug Fixes

* assign to variable ([7f4dcdc](https://github.com/LabShare/data-structures.git/commit/7f4dcdc))
* check by id instead of content ([fa1d5db](https://github.com/LabShare/data-structures.git/commit/fa1d5db))
* improve error message for duplicated id ([2e8c314](https://github.com/LabShare/data-structures.git/commit/2e8c314))
* improve get method ([b21826d](https://github.com/LabShare/data-structures.git/commit/b21826d))
* return false when id is absent ([725c42c](https://github.com/LabShare/data-structures.git/commit/725c42c))
* return false when id is absent ([4f4397e](https://github.com/LabShare/data-structures.git/commit/4f4397e))
* update error message ([af3ab10](https://github.com/LabShare/data-structures.git/commit/af3ab10))
* update error message ([bccaab5](https://github.com/LabShare/data-structures.git/commit/bccaab5))
* update test ([2f37d8a](https://github.com/LabShare/data-structures.git/commit/2f37d8a))
* update toposort related methods ([d9276c9](https://github.com/LabShare/data-structures.git/commit/d9276c9))
* use hash related methods for performance ([a861ccd](https://github.com/LabShare/data-structures.git/commit/a861ccd))


### Features

* add findHash and findAndDifferenceHash ([4a8a1dc](https://github.com/LabShare/data-structures.git/commit/4a8a1dc))
* add findOneHash ([f8192c4](https://github.com/LabShare/data-structures.git/commit/f8192c4))
* add removeHash and removeHashes methods ([e55e055](https://github.com/LabShare/data-structures.git/commit/e55e055))
* add removeMany and orderTriples methods ([4b63925](https://github.com/LabShare/data-structures.git/commit/4b63925))
* add, update and expose hash-related methods ([6844c99](https://github.com/LabShare/data-structures.git/commit/6844c99))
* create StringSet, improve PointerMap ([4c97df1](https://github.com/LabShare/data-structures.git/commit/4c97df1))
* export UUID ([0045082](https://github.com/LabShare/data-structures.git/commit/0045082))
* expose getIndex and getMetadata methods ([dccd086](https://github.com/LabShare/data-structures.git/commit/dccd086))
* implement bulk operations ([7d31561](https://github.com/LabShare/data-structures.git/commit/7d31561))
* import StringSet, create utils functions ([e1f05d0](https://github.com/LabShare/data-structures.git/commit/e1f05d0))
* improve MultiMap with bulk methods ([69dbf99](https://github.com/LabShare/data-structures.git/commit/69dbf99))
* include hash information for iterators ([df7281c](https://github.com/LabShare/data-structures.git/commit/df7281c))
* update plugins ([3a14747](https://github.com/LabShare/data-structures.git/commit/3a14747))


### BREAKING CHANGES

* plugins now must handle onAdd and onRemove as 
multi-items operations

# [2.0.0](https://github.com/LabShare/data-structures/compare/v1.1.5...v2.0.0) (2018-09-25)


### Bug Fixes

* add uuid to package.json ([b57291f](https://github.com/LabShare/data-structures/commit/b57291f))
* fix error message ([03f3464](https://github.com/LabShare/data-structures/commit/03f3464))
* remove unnecessary ifs ([b47c2d4](https://github.com/LabShare/data-structures/commit/b47c2d4))
* update collection plugin to add ids when missing ([914691a](https://github.com/LabShare/data-structures/commit/914691a))


### Features

* add get method to DefaultIndex ([ffb3031](https://github.com/LabShare/data-structures/commit/ffb3031))
* add getOne method to MultiMap ([3d9eb1e](https://github.com/LabShare/data-structures/commit/3d9eb1e))
* add methods to Graph ([d6b9cb8](https://github.com/LabShare/data-structures/commit/d6b9cb8))
* add new methods to Collection ([fc9521b](https://github.com/LabShare/data-structures/commit/fc9521b))
* add onBeforeAdd hook for plugins ([aae484a](https://github.com/LabShare/data-structures/commit/aae484a))
* update onInit hook output API ([ff91b47](https://github.com/LabShare/data-structures/commit/ff91b47))


### BREAKING CHANGES

* update onInit hook output API

## [1.1.5](https://github.com/LabShare/data-structures/compare/v1.1.4...v1.1.5) (2018-09-12)


### Bug Fixes

* **pkg:** refactor package.json script duplication ([a0c22f4](https://github.com/LabShare/data-structures/commit/a0c22f4))

## [1.1.4](https://github.com/LabShare/data-structures/compare/v1.1.3...v1.1.4) (2018-09-12)


### Bug Fixes

* **pkg:** npm publish config access should be public ([d5d325a](https://github.com/LabShare/data-structures/commit/d5d325a))

## [1.1.3](https://github.com/LabShare/data-structures/compare/v1.1.2...v1.1.3) (2018-09-12)


### Bug Fixes

* **ci:** remove unnecessary Travis config ([0f9ec35](https://github.com/LabShare/data-structures/commit/0f9ec35))

## [1.1.2](https://github.com/LabShare/data-structures/compare/v1.1.1...v1.1.2) (2018-09-12)


### Bug Fixes

* **pkg:** remove unused sample-config.json ([e3b9250](https://github.com/LabShare/data-structures/commit/e3b9250))

## [1.1.1](https://github.com/LabShare/data-structures/compare/v1.1.0...v1.1.1) (2018-09-12)


### Bug Fixes

* add release to package.json ([89114be](https://github.com/LabShare/data-structures/commit/89114be))
* attempt to use access: restricted for npm publish ([1cf7f9f](https://github.com/LabShare/data-structures/commit/1cf7f9f))
