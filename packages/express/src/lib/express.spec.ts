import { expressStanzaGuard, stanzaErrorHandler } from './express';

describe('express', () => {
    it('should return middleware function', () => {
        expect(expressStanzaGuard({guard:'github_guard'})).toBeInstanceOf(Function)
    })
})