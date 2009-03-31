var helpView = {
    render: function(){
        board.app(this.renderHelp());
    },
    renderHelp: function(){
        var node = div().id('about-wrapper').cls('round10').app(
            h2('Mire jó a memori?'),
            p('Szókincsünk fejlesztése és karbantartása energiaigényes feladat. Idegen nyelvű szöveg feldolgozásakor ki kell gyűjtenünk, meg kell tanulnunk, majd a felejtést megelőzendő időnként át kell ismételnünk az ismeretlen szavakat, kifejezéseket.'),
            p(
                'A memori tanulni nem tud helyettetek, de a többiben megpróbál segíteni:',
                ul(
                    li('Megoszthatjátok ismerőseitekkel, osztálytársaitokkal a leckéiteket.'),
                    li('Az új tananyagot kikérdezi véletlen sorrendben'),
                    li(strong('És ami a legjobb:'), ' nem engedi, hogy elfelejtsétek a verejtékes munkával megtanult szavakat.')
                )
            ),
            h2('De hogyan akadályozza meg a felejtést?'),
            p('A dolog kulcsa a szavak optimális időközönkénti ismétlése. Vannak könnyebb szavak, ezek szinte azonnal megragadnak az agyunkban, míg vannak nehezebbek, amiket sokszori ismétlés után is képesek vagyunk elfelejteni. A ',strong('Leitner módszer segítségével'),', amelyet kitalálójáról Sebastian Leitnerről neveztek el, a könnyebb szavakat ritkábban, míg a nehezebbek sűrűbben kell ismételnünk. Lássuk hát, hogy is műkdik.'),
            div().id('leitner-pic').html('&nbsp'),
            p('Képzeljük el, hogy a szavakat szókártyákra írjuk, amiket dobozokba rakunk. Öt dobozunk van, és minden új kártyát az első dobozba rakunk. Egy szó ismétlésekor, ha emlékszünk rá, akkor egyel nagyobb számú dobozba tesszük, ha nem, akkor mindig az elsőbe kerül vissza. A fenti képen zöld nyíl jelzi a sikeres, piros a sikertelen ismétléseket.'),
            p('Az első doboz kártyáit kell leggyakrabban, az ötödikben lévőket legritkábban ismételnünk. A Memori, hogy megfeleljen ezen elvnek a következő szabályt alkalmaza: Az első dobozból bármelyik szót kérdezheti, hisz ezek azért vannak ott mert újak, vagy mert nem az előző ismétlésnél nem tudtuk őket. A másik négy dobozban lévő kártyákra pedig az igaz, hogy sikeres ismétlés után az alábbi táblázatban meghatározott ideig nem kérdezi őket a program.'),
            table(
                tr(td('2. doboz'),td('1 nap')),
                tr(td('3. doboz'),td('3 nap')),
                tr(td('4. doboz'),td('7 nap')),
                tr(td('5. doboz'),td('30 nap'))
            ),
            h2('Mik azok az aktív kártyák?'),
            p('Azokat nevezzük aktív kártyákat, melyek közül Leitner módszer szerinti gyakorlás esetén választhat a program. Ezek az első dobozban lévők, plusz a magasabb számú dobozokból azok, melyeket az adott dobozhoz tartozó időszaknál (lásd fenti táblázat) régebben gyakoroltunk.'),
            h2('Milyen módszerekkel gyakorolhatjuk a szavakat?'),
            p('Mikor egy leckét ismétlünk, az alapértelmezett gyakorlási mód a Leitner módszer szerinti. Ilyenkor csak az aktív kártyák közül választ a program, és nekünk meg kell mondanunk, hogy tudjuk, vagy nem tudjuk az adott kártyán lévő szót, kifejezést.'),
            p('Ezen kívül a gyakorló oldalon lévő tetején lévő legördülő menüből választhatjuk azt a módszert, hogy a lecke összes szavát akarjuk gyakorolni sorban, vagy véletlen szerűen. Ilyenkor nem kell nyilatkoznunk arról, hogy tudjuk-e a szót, és megjelenő nyilakkal oda-vissza is tudunk lépkedni a kártyák között.'),
            h2('Mit mutat a grafikon a leckéimnél?'),
            p('A grafikon megmutatja, hogy hány darab szó van az egyes dobozokban. A halvány pirossal színezett rész mutaja az aktív kártyákat, melyeket gyakorolnunk kell!')
            // h2('Milyen sűrűn nyomjuk a mentés gombot?'),
            // p('Lecke szerkesztésekor, és gyakorlásakor keletkezik olyan információ, amit a Memorinak el kell mentenie, és ha aktív a mentés gomb, az azt jelzi, hogy van olyan információ, amit még nem mentett el.')
        );
        return node;
    },
    cleanUp: function(){
        board.clear();
    }
}