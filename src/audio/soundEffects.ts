// Sound engine - Audio disabled
class SilentSoundEngine {
  public setMuted(_muted: boolean) {}
  public getMuted(): boolean { return true; }
  public playClick() {}
  public playHover() {}
  public playTransition() {}
  public playSnap() {}
  public playPowerUp() {}
}

export const soundEngine = new SilentSoundEngine();
