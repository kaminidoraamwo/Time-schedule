import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateGallery } from './TemplateGallery';
import { TEMPLATES } from '../../constants';

describe('TemplateGallery', () => {
  it('renders a card per template with name and step count', () => {
    render(<TemplateGallery templates={TEMPLATES} onSelectTemplate={() => {}} />);
    for (const template of TEMPLATES) {
      expect(screen.getByText(template.name)).toBeInTheDocument();
    }
  });

  it('calls onSelectTemplate with the chosen template id', async () => {
    const onSelect = vi.fn();
    render(<TemplateGallery templates={TEMPLATES} onSelectTemplate={onSelect} />);

    const color = TEMPLATES.find((t) => t.name === 'カラー')!;
    await userEvent.click(screen.getByText('カラー'));

    expect(onSelect).toHaveBeenCalledWith(color.id);
  });
});
