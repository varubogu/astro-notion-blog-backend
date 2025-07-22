import { describe, it, expect } from "vitest";
import { makePostPropertyValue } from '../../../src/lib/notion/utils';

type DatabasePropertyConfigResponse = Parameters<typeof makePostPropertyValue>[0];

describe('makePostPropertyValue', () => {
    it('should handle date property', () => {
        const property = {
            type: 'date'
        } as DatabasePropertyConfigResponse;
        const value = '2023-10-01';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'date',
            date: { start: value },
        });
    });

    it('should handle multi_select property', () => {
        const property = {
            type: 'multi_select', multi_select: {
                options: {
                    'Option1': {
                        id: '1', name: 'Option1'
                    }
                }
            },
        } as DatabasePropertyConfigResponse;
        const value = 'Option1';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'multi_select',
            multi_select: [{ id: '1', name: 'Option1' }],
        });
    });

    it('should handle select property', () => {
        const property = {
            id: 'prop-id-select',
            type: 'select', select: {
                options: {
                    'Option1': {
                        id: '1', name: 'Option1'
                    }
                }
            },
        } as DatabasePropertyConfigResponse;
        const value = 'Option1';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'select',
            id: 'prop-id-select',
            select: { id: '1', name: 'Option1' },
        });
    });

    it('should handle email property', () => {
        const property = {
            id: 'prop-id-email',
            type: 'email'
        } as DatabasePropertyConfigResponse;
        const value = 'test@example.com';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'email',
            id: 'prop-id-email',
            email: value,
        });
    });

    it('should handle checkbox property', () => {
        const property = {
            id: 'prop-id-checkbox',
            type: 'checkbox'
        } as DatabasePropertyConfigResponse;
        const value = true;
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'checkbox',
            id: 'prop-id-checkbox',
            checkbox: value,
        });
    });

    it('should handle url property', () => {
        const property = {
            id: 'prop-id-url',
            type: 'url'
        } as DatabasePropertyConfigResponse;
        const value = 'https://example.com';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'url',
            id: 'prop-id-url',
            url: value,
        });
    });
});
