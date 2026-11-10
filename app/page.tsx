/**
 * Temporary start page: proves that fonts, tokens and components load. The real home page replaces it.
 */
import { Container, Stack } from '@med-o/ui';

export default function Home() {
  return (
    <Container as="main" size="prose">
      <Stack>
        <h1 className="medo-text-heading-lg">med.o Design System</h1>
        <p className="medo-text-body-md">The documentation site is under construction.</p>
      </Stack>
    </Container>
  );
}
