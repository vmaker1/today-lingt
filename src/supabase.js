import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pykyqwhhopmmgidqtamw.supabase.co";
const SUPABASE_KEY = "sb_publishable_vihLhKFuScp3ztAP3EWgAA_K1BnDtVO";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);