import { component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { TextShadow } from "~/components/text_shadow";
import { CharacterData } from "../../../core/character_manager";

export const CharacterProfile = component$<Pick<CharacterData, "profile" | "desc">>(({ profile, desc }) => {
  return (
    <>
      <div class="mb-4">{desc}</div>
      <div class="sm:flex sm:flex-col sm:items-center lg:grid lg:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(500px,1fr))]">
        {profile.length &&
          profile.map(([type, text], index) => (
            <div class="relative w-[432px] h-[224px] mb-4" key={index}>
              <Image
                src={`/Game/Senbei/UI/Textures/T_UI_menu_profile_data${index.toString().padStart(2, "0")}.png`}
                width={432}
                height={224}
              />
              <div class="absolute top-14 left-12">
                <div
                  style={{
                    position: "relative",
                    width: "336px",
                    height: "32px",
                  }}
                >
                  <Image
                    src={`/Game/Senbei/UI/Textures/T_UI_menu_profile_data06.png`}
                    width={336}
                    height={32}
                    operations={{
                      imgix: {
                        sat: 50,
                      },
                    }}
                  />
                </div>
              </div>
              <TextShadow>
                <div class="absolute top-12 left-0 w-full h-full text-center text-white font-bold text-2xl">{type}</div>
              </TextShadow>
              <div class="absolute top-28 left-4 w-[400px] h-fit text-center text-black font-semibold text-lg">
                {text}
              </div>
            </div>
          ))}
      </div>
    </>
  );
});
