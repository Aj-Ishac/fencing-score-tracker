import { supabase } from './supabaseClient'

class DatabaseService {
  async getFencers() {
    const { data, error } = await supabase
      .from('fencers')
      .select('*')
      .order('id')
    
    if (error) throw error
    return data
  }

  async addFencer(fencer) {
    const { data, error } = await supabase
      .from('fencers')
      .insert([fencer])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async getBouts() {
    const { data, error } = await supabase
      .from('bouts')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data
  }

  async addBout(bout) {
    const { data, error } = await supabase
      .from('bouts')
      .insert([bout])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async updateBout(boutId, updatedData) {
    const { data, error } = await supabase
      .from('bouts')
      .update(updatedData)
      .eq('id', boutId)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async deleteBout(boutId) {
    const { error } = await supabase
      .from('bouts')
      .delete()
      .eq('id', boutId)
    
    if (error) throw error
  }
}

export const databaseService = new DatabaseService() 