import { Component, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  public supabaseService = inject(SupabaseService);
  
  loading = signal(false);
  // On crée une copie locale pour l'édition
  profileData = { full_name: '', phone: '', avatar_url: '' };

  async ngOnInit() {
    // // Charger les infos existantes au démarrage
    // const user = this.supabaseService.currentUser();
    // const { data } = await this.supabaseService['supabase']
    //   .from('profiles')
    //   .select('*')
    //   .eq('id', user?.id)
    //   .single();
    // if (data) this.profile = data;
    // On s'abonne aux changements du profil
    const existingProfile = this.supabaseService.userProfile();
    if (existingProfile) {
      this.profileData = { ...existingProfile };
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.loading.set(true);
      const user = this.supabaseService.currentUser();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const publicUrl = await this.supabaseService.uploadAvatar(filePath, file);
      this.profileData.avatar_url = publicUrl;
    } catch (error: any) {
      alert("Erreur upload : " + error.message);
    } finally {
      this.loading.set(false);
    }
  }


  async saveProfile() {
    try {
      this.loading.set(true);
      await this.supabaseService.updateProfile(this.profileData);
      alert("Profil mis à jour !");
    } catch (error: any) {
      alert(error.message);
    } finally {
      this.loading.set(false);
    }
  }
}
