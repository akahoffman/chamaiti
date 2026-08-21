
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_ticket_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_ticket_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_ticket_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_ticket_comment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
