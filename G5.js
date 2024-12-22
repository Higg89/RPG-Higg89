// Классы оружия
class Weapon {
    constructor(name, attack, durability, range) {
        this.name = name;
        this.attack = attack;
        this.durability = durability;
        this.initDurability = durability;
        this.range = range;
    }

    takeDamage(damage) {
        this.durability = Math.max(this.durability - damage, 0);
    }

    getDamage() {
        if (this.durability <= 0) return 0;
        return this.durability >= this.initDurability * 0.3 ? this.attack : this.attack / 2;
    }

    isBroken() {
        return this.durability === 0;
    }
}

class Arm extends Weapon {
    constructor() {
        super("Рука", 1, Infinity, 1);
    }
}

class Bow extends Weapon {
    constructor() {
        super("Лук", 10, 200, 3);
    }
}

class Sword extends Weapon {
    constructor() {
        super("Меч", 25, 500, 1);
    }
}

class Knife extends Weapon {
    constructor() {
        super("Нож", 5, 300, 1);
    }
}

class Staff extends Weapon {
    constructor() {
        super("Посох", 8, 300, 2);
    }
}

class LongBow extends Bow {
    constructor() {
        super();
        this.name = "Длинный лук";
        this.attack = 15;
        this.range = 4;
    }
}

class Axe extends Sword {
    constructor() {
        super();
        this.name = "Секира";
        this.attack = 27;
        this.durability = 800;
    }
}

class StormStaff extends Staff {
    constructor() {
        super();
        this.name = "Посох Бури";
        this.attack = 10;
        this.range = 3;
    }
}

// Базовый класс Player
class Player {
    constructor(position, name) {
        this.position = position;
        this.name = name || this.getRandomName();
        this.life = 100;
        this.magic = 20;
        this.speed = 1;
        this.attack = 10;
        this.agility = 5;
        this.luck = 10;
        this.weapon = new Arm();
    }

    getRandomName() {
        const names = ["Игрок1", "Игрок2", "Игрок3"];
        return names[Math.floor(Math.random() * names.length)];
    }

    getLuck() {
        const randomNumber = Math.random() * 100;
        return (randomNumber + this.luck) / 100;
    }

    getDamage(distance) {
        if (distance === 0) distance = 1;
        if (distance > this.weapon.range) {
            return 0;
        } else {
            return (this.attack + this.weapon.getDamage()) * this.getLuck() / distance;
        }
    }

    takeAttack(damage) {
        if (this.isAttackBlocked()) {
            console.log(`${this.name} блокирует атаку!`);
            this.weapon.takeDamage(damage);
        } else if (this.dodged()) {
            console.log(`${this.name} уклоняется от атаки!`);
        } else {
            console.log(`${this.name} получает ${damage.toFixed(2)} урона.`);
            this.life = Math.max(this.life - damage, 0);
        }
    }

    tryAttack(enemy) {
        const distance = Math.abs(this.position - enemy.position);

        if (distance > this.weapon.range) {
            console.log(`${this.name} не может достать ${enemy.name}.`);
            return;
        }

        const wear = 10 * this.getLuck();
        this.weapon.takeDamage(wear);
        this.checkWeapon();

        let damage = this.getDamage(distance);

        // Лог атаки
        console.log(`[ЛОГ АТАКИ] ${this.name}: Урон = ${damage.toFixed(2)}, Дистанция = ${distance}, Оружие = ${this.weapon.name}, Прочность оружия = ${this.weapon.durability.toFixed(2)}`);

        if (this.position === enemy.position) {
            console.log(`${this.name} атакует вблизи! Урон удваивается.`);
            damage *= 2;
            enemy.moveRight(1);
        }

        enemy.takeAttack(damage);
    }

    moveRight(distance) {
        const movement = Math.min(distance, this.speed);
        this.position += movement;
        console.log(`${this.name} перемещается вправо. Позиция: ${this.position}`);
    }

    moveLeft(distance) {
        const movement = Math.min(distance, this.speed);
        this.position = Math.max(this.position - movement, 0);
        console.log(`${this.name} перемещается влево. Позиция: ${this.position}`);
    }

    move(distance) {
        if (distance < 0) {
            this.moveLeft(Math.abs(distance));
        } else {
            this.moveRight(distance);
        }
    }

    isAttackBlocked() {
        return this.getLuck() > (100 - this.luck) / 100;
    }

    dodged() {
        return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
    }

    checkWeapon() {
        if (this.weapon.isBroken()) {
            console.log(`${this.name} сломал оружие: ${this.weapon.name}`);
            if (this.weapon instanceof Knife) this.weapon = new Arm();
            else if (this.weapon instanceof Sword) this.weapon = new Knife();
            else if (this.weapon instanceof Bow) this.weapon = new Knife();
            else if (this.weapon instanceof Staff) this.weapon = new Knife();
            else if (this.weapon instanceof Axe) this.weapon = new Knife();
            else if (this.weapon instanceof LongBow) this.weapon = new Knife();
            else if (this.weapon instanceof StormStaff) this.weapon = new Knife();
        }
    }

    chooseEnemy(players) {
        return players.filter(player => player !== this && player.life > 0)
            .reduce((weakest, player) => (player.life < weakest.life ? player : weakest));
    }

    moveToEnemy(enemy) {
        if (this.position < enemy.position) {
            this.moveRight(enemy.position - this.position);
        } else if (this.position > enemy.position) {
            this.moveLeft(this.position - enemy.position);
        }
    }

    turn(players) {
        const enemy = this.chooseEnemy(players);
        if (!enemy) return;

        this.moveToEnemy(enemy);
        this.tryAttack(enemy);
    }
}

// Наследуемые классы игроков
class Warrior extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 120;
        this.magic = 20;
        this.speed = 2;
        this.attack = 10;
        this.description = "Воин";
        this.weapon = new Sword();
    }

    takeAttack(damage) {
        if (this.life < 60 && this.getLuck() > 0.8) {
            if (this.magic > 0) this.magic = Math.max(this.magic - damage, 0);
            else super.takeAttack(damage);
        } else {
            super.takeAttack(damage);
        }
    }
}

class Archer extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 35;
        this.attack = 5;
        this.agility = 10;
        this.description = "Лучник";
        this.weapon = new Bow();
    }

    getDamage(distance) {
        if (distance > this.weapon.range) return 0;
        return (this.attack + this.weapon.getDamage()) * this.getLuck() * distance / this.weapon.range;
    }
}

class Mage extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 70;
        this.magic = 100;
        this.attack = 5;
        this.agility = 8;
        this.description = "Маг";
        this.weapon = new Staff();
    }

    takeAttack(damage) {
        if (this.magic > 50) {
            this.life = Math.max(this.life - damage / 2, 0);
            this.magic = Math.max(this.magic - 12, 0);
        } else {
            super.takeAttack(damage);
        }
    }
}



class Dwarf extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 130;
        this.attack = 15;
        this.luck = 20;
        this.description = "Гном";
        this.weapon = new Axe();
        this.attackCount = 0; // Счетчик ударов
    }

    takeDamage(damage) {
        this.attackCount++; // Увеличиваем счетчик при каждом ударе
        if (this.attackCount % 6 === 0) {
            console.log(`${this.name} отразил удар! (тк. он шестой)`);
            return; // Отражение удара, урон не наносится
        }

        this.health -= damage;
        console.log(`${this.name} получает ${damage} урона. Осталось здоровья: ${this.health}`);
    }
}


class Crossbowman extends Archer {
    constructor(position, name) {
        super(position, name);
        this.life = 85;
        this.attack = 8;
        this.agility = 20;
        this.luck = 15;
        this.description = "Арбалетчик";
        this.weapon = new LongBow();
    }
}

class Demiurge extends Mage {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 120;
        this.attack = 6;
        this.luck = 12;
        this.description = "Демиург";
        this.weapon = new StormStaff();
    }

    getDamage(distance) {
        if (this.magic > 0 && this.getLuck() > 0.6) {
            return super.getDamage(distance) * 1.5;
        }
        return super.getDamage(distance);
    }
}

// Функция игры
function play(players) {
    let round = 1;
    while (players.filter(player => player.life > 0).length > 1) {
        console.log(`\n=== Раунд ${round} ===`);
        players.forEach(player => {
            const aliveEnemies = players.filter(p => p !== player && p.life > 0);
            if (aliveEnemies.length > 0) {
                const enemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                player.turn(players);
            }
        });
        round++;
    }

    const alivePlayers = players.filter(player => player.life > 0);
    if (alivePlayers.length === 1) {
        console.log(`Победитель: ${alivePlayers[0].name}`);
    } else {
        console.log('Все игроки погибли. Победителя нет.');
    }
}

// Пример игры
const players = [
    new Warrior(0, "Алёша Попович"),
    new Archer(2, "Леголас"),
    new Mage(4, "Гендальф"),
    new Dwarf(6, "Гимли"),
    new Crossbowman(8, "Арбалетчик"),
    new Demiurge(10, "Демиург"),
];

play(players);
