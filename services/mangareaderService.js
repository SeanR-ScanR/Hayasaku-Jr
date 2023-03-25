const Chapitre = require("../entity/chapitre");
const superagent = require("superagent");
const jsdom = require("jsdom");
const { unscramble } = require("../utils/scramble");
const { JSDOM } = jsdom;


module.exports.getChapitre = async (manga,numero) => {
    const result  = await superagent.get(`https://mangareader.to/ajax/manga/reading-list/${manga}`);
    const DOM = new JSDOM(JSON.parse(result.res.text).html);
    const chapitre = DOM.window.document.querySelector(`#en-chapters li[data-number='${numero}']`);
    if(!chapitre){
        return "Numéro de chapitre invalide"
    }
    return await this.getChapitreById(chapitre)
}

module.exports.getChapitreById = async (chapitre) => {
    const DOM = await superagent.get(`https://mangareader.to/ajax/image/list/chap/${chapitre.dataset.id}?mode=vertical&quality=low`).then(({res}) => new JSDOM(JSON.parse(res.text).html));
    let shuffled = false;
    const images = await Promise.all(Array.from(DOM.window.document.querySelectorAll(".iv-card")).map(async (e,i) =>{
        if(e.classList.contains('shuffled')){
            shuffled = true;
            return unscramble(e.dataset.url,i);
        }else return e.dataset.url;
    }))
    const number = chapitre.dataset.number;
    const title = chapitre.querySelector(".name").textContent.match(/:(.*)/)[1].trim()
    const href = chapitre.querySelector("a").href;
    if(shuffled){
        const pageName = images.map(e => e.name);
        const files = images.map(e => e.files);
        return new Chapitre(pageName,number,title,pageName.length,(page)=>`attachment://${page}`,`https://mangareader.to${href}`,files)
    }else{
        return new Chapitre(images,number,title,images.length,(page)=>page,`https://mangareader.to${href}`);
    }
}

