import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InlineEdit from './InlineEdit';

function setup(onSave = vi.fn().mockResolvedValue(undefined)) {
  render(<InlineEdit value="À faire" label="Titre de la liste" onSave={onSave} validate={(v) => (v ? undefined : 'Le titre est obligatoire')} />);
  return onSave;
}

describe('InlineEdit (renommer en cliquant)', () => {
  it('affiche le texte, puis un champ au clic', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
    expect(screen.getByLabelText('Titre de la liste')).toHaveValue('À faire');
  });

  it('enregistre avec Entrée', async () => {
    const onSave = setup();
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
    const input = screen.getByLabelText('Titre de la liste');
    fireEvent.change(input, { target: { value: '  Terminé ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledWith('Terminé');
    await waitFor(() => expect(screen.queryByLabelText('Titre de la liste')).not.toBeInTheDocument());
  });

  it('annule avec Échap sans enregistrer', () => {
    const onSave = setup();
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
    const input = screen.getByLabelText('Titre de la liste');
    fireEvent.change(input, { target: { value: 'Autre' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'À faire' })).toBeInTheDocument();
  });

  it("n'enregistre pas si le titre n'a pas changé", () => {
    const onSave = setup();
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
    fireEvent.keyDown(screen.getByLabelText('Titre de la liste'), { key: 'Enter' });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('affiche une erreur et reste ouvert si le titre est invalide', () => {
    const onSave = setup();
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
    const input = screen.getByLabelText('Titre de la liste');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Le titre est obligatoire')).toBeInTheDocument();
  });

  it("affiche l'erreur du serveur si l'enregistrement échoue", async () => {
    setup(vi.fn().mockRejectedValue(new Error('Liste introuvable')));
    fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
    const input = screen.getByLabelText('Titre de la liste');
    fireEvent.change(input, { target: { value: 'Terminé' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('Liste introuvable')).toBeInTheDocument();
  });
});
