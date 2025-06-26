/*alert(1)
a=10
alert(a)
alert(window.a)

//onload, cand se incarca toate elementele din pagina atunci executam
//codul, adica aici dam log la id-ul butonului, daca nu era in functie dadea null
window.onload=function(){
btn=document.getElementById("filtrare")
console.log(btn.id)
btn.syle.backgroundColor="pink";
}
 */

window.onload=function() {
    btn = document.getElementById("filtrare");
    btn.onclick = function () {
        let inpNume = document.getElementById("inp-nume").value.trim.toLowerCase();
        let vectRadio = document.getElementsByName("gr_rad");

        let inpCalorii = null
        let minCalorii = null
        let maxCalorii = null
        for (let rad of vectRadio) {
            if (rad.checked) {
                inpCalorii = rad.value
                if (inpCalorii != "toate") {
                    [minCalorii, maxCalorii] = inpCalorii.split(":") //350:700 -> vector cu 350 si 700,
                    minCalorii = parseInt(minCalorii)
                    maxCalorii = parseInt(maxCalorii)
                }


                break;
            }
        }

        let inpPret = document.getElementById("inp-pret").value;

        let produse = document.getElementsByClassName("produs");
        for (let prod of produse) {
            prod.style.display = "none";

            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();

            let cond1 = nume.startsWith(inpNume)
            if (cond1) {
                prod.style.display = "block";
            }

            let calorii = parseInt(prod.getElementsByClassName("val-calorii")[0].innerHTML.trim().toLowerCase());
            let cond2 = (inpCalorii = "toate") || (minCalorii<=calorii&& calorii<=maxCalorii)

            let pret=parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML.trim().toLowerCase());

            let cond3=(inpPret<pret)

            if(cond1&&cond2&&cond3){
                prod.style.display = "block";
            }
        }
        //In continuare trebuie sa punem celalalte filtre
    }
}

