(function(){
  const url='https://jwyayfkssyagvnablttg.supabase.co';
  const key='sb_publishable_qm8yJyH_5LfP-oZ1sz4QLg_r9J5VdnA';
  window.CELEBRATIONS_SUPABASE_URL=url;
  window.CELEBRATIONS_SUPABASE_KEY=key;
  if(window.supabase?.createClient){
    window.celebrationsSupabase=window.supabase.createClient(url,key,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
  }
})();