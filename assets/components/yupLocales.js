import printValue from './printValue';
// import { LocaleObject, FormatErrorParams } from 'yup';

export let mixed = {
    required: 'Ce champ est obligatoire',
    // notType: ({ path, type, value, originalValue }) => {
    //     let msg = "";
    //     if (type === 'number') {
    //         msg = "La valeur doit être de la forme suivante : 1.5 (avec un point et non une virgule)";
    //     } else {
    //         const isCast = originalValue != null && originalValue !== value;
    //         msg =
    //             `${path} doit être un type \`${type}\`, ` +
    //             `mais la valeur finale était: \`${printValue(value, true)}\`` +
    //             (isCast
    //                 ? ` (coulée de la valeur \`${printValue(originalValue, true)}\`).`
    //                 : '.');
    //
    //         if (value === null) {
    //             msg +=
    //                 `\n Si « null » est conçue comme une valeur vide assurez-vous de marquer le schéma comme` +
    //                 ' `.nullable()`';
    //         }
    //     }
    //
    //     return msg;
    // }
};

export let string = {
    email: 'Cet email n\'est pas valide'
};

export default {
    mixed,
    string,
};