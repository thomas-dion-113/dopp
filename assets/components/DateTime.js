import format from "date-fns/format";
import React, {useState, useEffect} from 'react';
import frLocale from "date-fns/locale/fr";
import DateFnsUtils from '@date-io/date-fns';
import '@material-ui/core';
import {DateTimePicker, DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';

class LocalizedUtils extends DateFnsUtils {
    getDateTimePickerHeaderText(date) {
        return format(date, "d MMM", {locale: this.locale});
    }
}

const DateTime = ({ field, form, ...other }) => {
    const currentError = form.errors[field.name];

    useEffect(() => {
        document.querySelector('.MuiInputBase-input.MuiOutlinedInput-input').classList.add('form-control');
    });

    return (
        <MuiPickersUtilsProvider utils={LocalizedUtils} locale={frLocale}>
            <DateTimePicker
                disableFuture
                ampm={false}
                format="dd/MM/yyyy HH:mm"
                inputVariant="outlined"
                cancelLabel="Annuler"
                name={field.name}
                value={field.value}
                helperText={currentError}
                error={Boolean(currentError)}
                onError={error => {
                    // handle as a side effect
                    if (error !== currentError) {
                        form.setFieldError(field.name, error);
                    }
                }}
                // if you are using custom validation schema you probably want to pass `true` as third argument
                onChange={date => form.setFieldValue(field.name, date, true)}
                {...other}
            />
        </MuiPickersUtilsProvider>
    );
}

export default DateTime