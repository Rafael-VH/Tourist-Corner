-- Add branch deletion safety: prevent deleting main hotels that have branches
CREATE OR REPLACE FUNCTION public.check_branch_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to delete a main hotel that has branches, raise error
  IF OLD.is_main = true THEN
    IF EXISTS (SELECT 1 FROM public.hotels WHERE branch_of = OLD.id) THEN
      RAISE EXCEPTION 'No puedes eliminar un hotel principal que tiene sucursales. Elimina las sucursales primero.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_branch_deletion ON public.hotels;
CREATE TRIGGER trg_check_branch_deletion
  BEFORE DELETE ON public.hotels
  FOR EACH ROW
  EXECUTE FUNCTION public.check_branch_deletion();
