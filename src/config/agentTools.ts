export const tools = [
  {
    type: 'function',
    function: {
      name: 'get_information_from_skylink',
      description: 'Use for questions about news, trends, or general information. This is for finding content created by OTHER users.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question or topic to search for, e.g., "latest news on AI" or "trending posts today".',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'post_to_skylink',
      description: 'Use this to create a new post or tweet when the user explicitly asks to publish content.',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The text content of the post to be created.',
          },
        },
        required: ['content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_skylink_profile',
      description: 'Use this to modify the user\'s own profile data, such as their name, bio, location, or website.',
      // --- PARAMETERS SIMPLIFIED BELOW ---
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: "The user's new full name.",
          },
          description: {
            type: 'string',
            description: "The user's new bio or description.",
          },
          location: {
            type: 'string',
            description: "The user's new location. Consolidate any mention of city, district, or place into this single field.",
          },
          website: {
            type: 'string',
            description: "The user's new website URL.",
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_skylink_profile',
      description: 'Use this to retrieve and display the user\'s OWN profile information. Use it when the user asks "what is my location?", "show my bio", or "what does my profile say?".',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
] as const satisfies Array<{
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
}>;


