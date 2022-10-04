import { Box, Input, Text } from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import React from 'react'
import * as yup from 'yup'

const PHONE_REGEX = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
let emailValidation = yup.object().shape({
  email: yup.string().email('Not a proper email').required('email is required'), // pass your error message string
})

let phoneValidation = yup.object().shape({
  phone_number: yup
    .string()
    .required('required')
    .min(8, 'to short')
    .max(20, 'to long')
    .matches(PHONE_REGEX, 'Phone number is not valid'),
})

const TextInputValidation = registerComponent('Text Input With Validation', {
  type: 'none',
  icon: 'IconPencil',
  group: 'input',
  defaultProps: {
    valueType: 'email',
    label: 'Text Input',
    placeholder: 'Placeholder here',
    hidden: false,
    defaultValue: '',
    data: {
      inputID: 'Input',
      field: { type: 'string', options: { format: 'text' } },
      validation: {
        required: false,
      },
    },
  },
  propDefinition: {
    valueType: {
      group: 'Type',
      type: 'string',
      options: {
        format: 'select',
        options: [
          { label: 'email', value: 'email' },
          { label: 'telephone', value: 'tel' },
        ],
      },
    },
    label: { group: 'Design', type: 'expression', options: {} },
    placeholder: {
      group: 'Design',
      type: 'expression',
      options: {},
    },
    hidden: {
      group: 'Design',
      type: 'boolean',
      options: { format: 'boolean' },
    },
    data: {
      group: 'Design',
      type: 'state',
      options: {
        inputID: 'Input',
        field: { type: 'string', options: { format: 'text' } },
      },
    },
    defaultValue: {
      group: 'Design',
      type: 'expression',
      options: {},
    },
  },
  Component: (props) => {
    const valueType = props.hooks.useTemplate(props.properties.valueType)
    const placeholder = props.hooks.useTemplate(props.properties.placeholder)
    const defaultValue = props.hooks.useTemplate(props.properties.defaultValue)
    const title = props.hooks.useTemplate(props.properties.label)
    const data = props.hooks.useRuntimeInput(
      props.properties.data,
      props.data.page.row,
      {
        validate: (value) => {
          if (typeof value === 'undefined') {
            return { error: '' }
          } else if (!value) {
            return { error: 'Required field, Please enter the data' }
          }
          if (valueType === 'email') {
            emailValidation
              .validate({
                email: value,
              })
              .then((valid) => {
                setErrorMessage('')
              })
              .catch((err) => {
                setErrorMessage(err.errors[0])
                return { error: err.errors[0] }
              })
          }
          if (valueType === 'tel') {
            phoneValidation
              .validate({ phone_number: value })
              .then((valid) => {
                setErrorMessage('')
              })
              .catch((err) => {
                setErrorMessage(err.errors[0])
                return { error: err.errors[0] }
              })
          }
        },
      },
    )

    React.useEffect(() => {
      data.onChange(data.value || defaultValue)
      data.validation.error
    }, [defaultValue, data.onChange])

    const [errorMessage, setErrorMessage] = React.useState<string>('')

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        data.onChange(e.currentTarget.value)
        if (valueType === 'email' && e.currentTarget?.value.length) {
          emailValidation
            .validate({
              email: e.currentTarget.value,
            })
            .then((valid) => {
              setErrorMessage('')
            })
            .catch((err) => {
              setErrorMessage(err.errors[0])
            })
        }
        if (valueType === 'tel' && e.currentTarget?.value.length) {
          phoneValidation
            .validate({ phone_number: e.currentTarget?.value })
            .then((valid) => {
              setErrorMessage('')
            })
            .catch((err) => {
              setErrorMessage(err.errors[0])
            })
        }
      },
      [data.onChange],
    )

    return (
      <Box
        bg="white"
        display={props.properties.hidden ? 'none' : undefined}
        p="4"
      >
        <Text fontSize="lg" pb={2} data-test="text-input-title">
          {title}
        </Text>
        <Input
          placeholder={placeholder}
          bgColor="#fff"
          key={props.properties.data.inputID}
          name={props.properties.data.inputID}
          defaultValue={data.value ? data.value.toString() : ''}
          onChange={handleChange}
          style={{ border: '1px solid rgb(226, 232, 240)' }}
          _focus={{ shadow: '0px' }}
          data-test="text-input"
          type={valueType}
        />
        {!!data.validation.error && (
          <Text fontSize="sm" color="red" data-test="text-input-error">
            {data.validation.error}
          </Text>
        )}
        {!!errorMessage && (
          <Text fontSize="sm" color="red" data-test="text-input-error">
            {errorMessage}
          </Text>
        )}
      </Box>
    )
  },
})

export default TextInputValidation
