import { describe, it, expect } from "vitest";
import { makePostPropertyValue } from '../../../src/lib/notion/utils';
import { DatabasePropertyConfigResponse } from "@notionhq/client/build/src/api-endpoints";

describe('makePostPropertyValue', () => {
    it('should handle date property', () => {
        const property: DatabasePropertyConfigResponse = {
            type: 'date'
        };
        const value = '2023-10-01';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'date',
            date: { start: value },
        });
    });

    it('should handle multi_select property', () => {
        const property: DatabasePropertyConfigResponse = {
            type: 'multi_select', multi_select: {
                options: {
                    'Option1': {
                        id: '1', name: 'Option1'
                    }
                }
            }
        };
        const value = 'Option1';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'multi_select',
            multi_select: [{ id: '1', name: 'Option1' }],
        });
    });

    it('should handle select property', () => {
        const property: DatabasePropertyConfigResponse = {
            type: 'select', select: {
                options: {
                    'Option1': {
                        id: '1', name: 'Option1'
                    }
                }
            }
        };
        const value = 'Option1';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'select',
            id: property.id,
            select: { id: '1', name: 'Option1' },
        });
    });

    it('should handle email property', () => {
        const property: DatabasePropertyConfigResponse = {
            type: 'email'
        };
        const value = 'test@example.com';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'email',
            id: property.id,
            email: value,
        });
    });

    it('should handle checkbox property', () => {
        const property: DatabasePropertyConfigResponse = {
            type: 'checkbox'
        };
        const value = true;
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'checkbox',
            id: property.id,
            checkbox: value,
        });
    });

    it('should handle url property', () => {
        const property: DatabasePropertyConfigResponse = {
            type: 'url'
        };
        const value = 'https://example.com';
        const result = makePostPropertyValue(property, value);
        expect(result).toEqual({
            type: 'url',
            id: property.id,
            url: value,
        });
    });
});
