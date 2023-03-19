import { PostWillRenderEmbed } from './index.jsx';

describe('PostWillRenderEmbed', () => {
    it('should return a valid UUIDv4 string', () => {
        const post = new PostWillRenderEmbed(null);
        const uuid = post.uuidv4();
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[8|9|aA|bB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
        expect(uuid).toMatch(uuidRegex);
    });
});