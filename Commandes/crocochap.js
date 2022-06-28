const { default: axios } = require("axios");
const { MessageActionRow, MessageButton } = require("discord.js");
const { getChapitre } = require("../services/mangadexService");
module.exports.run = async(client, message, args) =>{        
    const [chap,numero] = [args[1],args[3]];
    if(!chap || chap == "" || Number.isNaN(chap)) return message.channel.send("Veuillez rentrer un numéro de chapitre valide");
    const chapitre = await getChapitre("3395f559-5f90-4049-9dae-75b8918cadb9",chap);
    if(typeof chapitre == "string") return message.channel.send(chapitre);
    const embedList = chapitre.getEmbedList();
    if(numero && numero!="" && !Number.isNaN(numero) && numero <= chapitre.nbPages && numero>0) embedList.index = numero-1;
    const content = {embeds:[embedList.get()]};
    if(chapitre.nbPages > 1){
        const row =new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('before')
                .setLabel("<")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("next")
                .setLabel(">")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("lock")
                .setLabel("🔒")
                .setStyle("SECONDARY"),
        );
        content.components = [row];
    }
    const msg = await message.channel.send(content);
    if(chapitre.nbPages > 1){
        const interact = msg.createMessageComponentCollector({time:180000});

        interact.on("collect",async i =>{
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
};
module.exports.help = {
    name:["crocochap","cc"],
    help:"> Affiche une page d'un chapitre de Kaguya Sama",
    cmd:"crocochap/cc <chap> [page]",
    commandeReste : true,
}
