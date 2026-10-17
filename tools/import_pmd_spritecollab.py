#!/usr/bin/env python3
"""Fetch PMDCollab animation sheets with respect for non-commercial CC BY-NC.
Default installs only Mewtwo 0150 and Mew 0151 for isolated battle pilot.
--all supports incremental catalogue imports without forcing all sprites
to be preloaded by Android clients or rewriting approved battle animations.
Run manually: python tools/import_pmd_spritecollab.py --pokemon 150 151
Requires internet in CI/developer environment.
"""
import argparse, json, time, urllib.request, urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE="https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite"
ANIMS=("Idle", "Walk", "Attack", "Shoot", "Hurt", "Sleep", "Faint")
def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"PokemonTorre-FanProject/1.0"})
    with urllib.request.urlopen(req,timeout=30) as rsp:
        return rsp.read()
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--pokemon",nargs="+",type=int,default=[150,151])
    ap.add_argument("--all",action="store_true",help="all Kanto IDs (incrementally; no bundled preload)")
    ap.add_argument("--dry-run",action="store_true")
    args=ap.parse_args()
    selected=list(range(1,152)) if args.all else sorted(set(args.pokemon))
    dest=ROOT/"assets"/"pmd-spritecollab"
    manifest={"repository":"https://github.com/PMDCollab/SpriteCollab",
              "license":"CC BY-NC 4.0","commercial":False,
              "notice":"See CREDITS_SPRITECOLLAB.md, credit_names.txt and spritebot_credits.txt in source upstream",
              "files":{}}
    for pokedex_id in selected:
        key=f"{pokedex_id:04d}"
        manifest["files"][key]=[]
        for filename in ("AnimData.xml",)+(tuple(f"{a}-Anim.png" for a in ANIMS)):
            url=f"{BASE}/{key}/{filename}"
            if args.dry_run:
                print("PLAN",url)
                continue
            out=dest/key/filename
            try:
                if not out.is_file():
                    out.parent.mkdir(parents=True,exist_ok=True)
                    payload=fetch(url)
                    if filename.endswith(".png") and not payload.startswith(bytes.fromhex("89504e470d0a1a0a")):
                        raise ValueError("invalid PNG")
                    if filename.endswith(".xml") and b"<" not in payload[:128]:
                        raise ValueError("invalid AnimData")
                    out.write_bytes(payload)
                    time.sleep(.07)
                manifest["files"][key].append(str(out.relative_to(ROOT)))
            except (urllib.error.HTTPError,ValueError) as exc:
                print(f"SKIP {key}/{filename}: {exc}")
        if not manifest["files"][key] and not args.dry_run:
            manifest["files"].pop(key)
    if not args.dry_run:
        (dest/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
        print("Imported",sum(map(len,manifest["files"].values())),"files for",len(manifest["files"]),"Pokemon")
if __name__=="__main__":
    main()
