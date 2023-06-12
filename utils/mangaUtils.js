const { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } = require("discord.js");
const { getChapitre, getChapitreById, getChapitreInfoById } = require("../services/mangadexService");
const { getChapitre:getChapitreMangaReader } = require("../services/mangareaderService");
const { getChapitre:getChapitreGist } = require("../services/gistService");

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {Array} args 
 * @param {string} id 
 * @param {string} [slug] 
 * @returns 
 */
module.exports.send = async (interaction,chap,numero,{id:research,langue,idChap,mangaReader,cubari,options}) => {
    //return interaction.reply({content:"suite à un changement dans discord ou mangadex je ne peux pas garantir le fonctionnement de cette commande et elle sera donc down temporairement...",ephemeral:true});
    let chapitre;
    let defer = false;
    if(idChap){
        let data = await getChapitreInfoById(idChap);
        chapitre = await getChapitreById(data);
        if(typeof chapitre == "string") return interaction.reply({content:chapitre,ephemeral:true});
    }else{
        if(!chap || chap == "" || Number.isNaN(chap)) return interaction.reply({content:"Veuillez rentrer un numéro de chapitre valide",ephemeral:true});
        if(mangaReader){
            interaction.deferReply();
            defer = true;
            chapitre = await getChapitreMangaReader(research,chap);
        }else if(cubari){
            chapitre = await getChapitreGist(research,chap,cubari);
        }else{
            chapitre = await getChapitre(research,chap,options,langue);
        }
        if(typeof chapitre == "string"){
            if(defer){
                return interaction.channel.send({content:chapitre,ephemeral:true})
            }
            return interaction.reply({content:chapitre,ephemeral:true})
        }
        
    }
    const embedList = chapitre.getEmbedList();

    if(numero && numero!="" && !Number.isNaN(numero) && numero <= chapitre.nbPages && numero>0) embedList.index = numero-1;
    
    const content = embedList.getContent();

    if(chapitre.nbPages > 1){
        const row =new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('before')
                .setLabel("<")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel(">")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("lock")
                .setLabel("🔒")
                .setStyle(ButtonStyle.Secondary),
        );
        content.components = [row];
    }
    if(defer){
        interaction.followUp(content);
    }else{
        interaction.reply(content);
    }
    const msg = await interaction.fetchReply()

    if(chapitre.nbPages > 1){
        const interact = msg.createMessageComponentCollector({time:180000});
        
        interact.on("collect",async i =>{
            if(i.user.id != interaction.user.id) return i.reply({content:"Tu peux pas cheh !",ephemeral:true}) 
            if(i.customId === "before"){
                embedList.left(i);
            }else if(i.customId === "next"){
                embedList.right(i);
            }else if(i.customId === "lock"){
                interact.stop();
            }
        })

        interact.on("end",async i => {
            msg.edit({components:[]});
        })
    }
}
