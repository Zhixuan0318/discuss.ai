import { generateQueries } from './planner.js';

// Example markdown content
const markdownContent = `
# The Impact of Climate Change

Climate change refers to long-term shifts in temperatures and weather patterns, primarily caused by human activities, especially the burning of fossil fuels. These changes have profound effects on ecosystems, sea levels, and weather events.

## Key Points

- **Rising Temperatures**: Global temperatures have risen by 1.2°C since the late 19th century.
- **Melting Ice Caps**: Polar ice caps are melting at an accelerated rate, contributing to sea-level rise.
- **Extreme Weather**: Increased frequency of hurricanes, droughts, and wildfires.

## Counterarguments

Some argue that climate change is a natural phenomenon and not significantly influenced by human activities. They point to historical climate fluctuations as evidence.

## Conclusion

Addressing climate change requires global cooperation, policy changes, and the adoption of sustainable practices to mitigate its effects.
`;

const numberOfQueries = 2

// Generate queries based on the markdown content
generateQueries(markdownContent, numberOfQueries)
  .then((queries) => {
    console.log('Generated Queries:', queries);
  })
  .catch((error) => {
    console.error('Error generating queries:', error);
  });